import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { add } from "date-fns"
import { randomUUID } from "crypto"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { EmailAdapter } from "src/features/auth-main/infrastructure/adapters/email.adapter"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"
import { generateHashManager } from "src/features/auth-main/infrastructure/services/generate-hash.service"


export class RegistrationSqlCommandCopy {
  constructor(
    public login: string,
    public email: string,
    public password: string
  ) {
  }
}

@CommandHandler(RegistrationSqlCommandCopy)
export class RegistrationSqlCopy implements ICommandHandler<RegistrationSqlCommandCopy> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected emailAdapter: EmailAdapter,
  ) {
  }

  async execute(command: RegistrationSqlCommandCopy): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUserByLoginOrEmail({ login: command.login, email: command.email })
    if (user?.email === command.email) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (user?.login === command.login) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)

    const passwordHash = await generateHashManager(command.password)
    const newDate = new Date(Date.now()).toISOString()

    let newUser
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      newUser = await this.usersSqlRepository.createUser({
        login: command.login,
        email: command.email,
        passwordHash: passwordHash,
        createdAt: newDate
      }, queryRunner)

      const emailConfirmationDto = {
        userId: newUser.userId,
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(Date.now()), {
          hours: 1,
          minutes: 3,
        }).toISOString(),
        isConfirmed: false
      }
      console.log("confirmationCode", emailConfirmationDto.confirmationCode)
      await this.usersSqlRepository.createEmailConfirmation({ emailConfirmationDto, queryRunner })
      // await this.usersSqlRepository.createBanInfo(newUser.userId, queryRunner)
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log("RegistrationSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.USER_NOT_DELETED)
    } finally {
      await queryRunner.release()
    }

    // SENDING EMAIL ↓↓↓ TODO TO CLASS
    this.emailAdapter.sendConfirmationCode(newUser)
    // if (isSend === false) {
    //   await this.usersSqlRepository.deleteUser(newUser.id)
    //   return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    // }
    await this.usersSqlRepository.createSentConfirmCodeDate(newUser.userId, newDate)
    return new Contract(true, null)
  }


}