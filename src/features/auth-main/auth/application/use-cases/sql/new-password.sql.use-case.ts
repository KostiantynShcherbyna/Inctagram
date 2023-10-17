import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConfigService, ConfigType } from "@nestjs/config"
import { AuthRepositoryOrmCopy } from "../../../repository/typeorm/auth-repository.orm"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { TokensService } from "src/features/auth-main/infrastructure/services/tokens.service"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"
import { Secrets } from "src/features/auth-main/infrastructure/utils/constants"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"
import { generateHashManager } from "src/features/auth-main/infrastructure/services/generate-hash.service"


export class NewPasswordSqlCommandCopy {
  constructor(public newPassword: string, public recoveryCode: string) {
  }
}

@CommandHandler(NewPasswordSqlCommandCopy)
export class NewPasswordSqlCopy implements ICommandHandler<NewPasswordSqlCommandCopy> {
  constructor(
    protected tokensService: TokensService,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected configService: ConfigService<ConfigType<any>, true>,
    protected authSqlRepository: AuthRepositoryOrmCopy,
  ) {
  }

  async execute(command: NewPasswordSqlCommandCopy): Promise<Contract<null | boolean>> {

    const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
    const verifiedEmailDto = await this.tokensService.verifyToken(command.recoveryCode, passwordRecoveryCodeSecret)
    if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const lastRecoveryCodeDto = await this.authSqlRepository.findLastRecoveryCodeByEmail(verifiedEmailDto.email)
    if (lastRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
    if (lastRecoveryCodeDto.recoveryCode !== command.recoveryCode) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)

    const user = await this.usersSqlRepository.findUserByEmail(verifiedEmailDto.email)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const newPasswordHash = await generateHashManager(command.newPassword)
    await this.usersSqlRepository.updatePasswordHash(user.userId, newPasswordHash)

    await this.authSqlRepository.deactivatePasswordRecoveryCode(lastRecoveryCodeDto.recoveryCodeId)

    return new Contract(true, null)
  }


}