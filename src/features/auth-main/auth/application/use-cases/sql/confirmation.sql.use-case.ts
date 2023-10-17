import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"

export class ConfirmationSqlCommandCopy {
  constructor(public code: string) {
  }
}

@CommandHandler(ConfirmationSqlCommandCopy)
export class ConfirmationSqlCopy implements ICommandHandler<ConfirmationSqlCommandCopy> {
  constructor(
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
  }
  async execute(command: ConfirmationSqlCommandCopy): Promise<Contract<null | boolean>> {
    const user = await this.usersSqlRepository.findUserByConfirmCode(command.code)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.isConfirmed === true)
      return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
    if (user.expirationDate && (user.expirationDate < new Date()))
      return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    await this.usersSqlRepository.updateConfirmation({ userId: user.userId, isConfirm: true })

    return new Contract(true, null)
  }


}