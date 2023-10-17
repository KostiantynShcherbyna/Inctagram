import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { AuthRepositoryOrmCopy } from "src/features/auth-main/auth/repository/typeorm/auth-repository.orm"
import { EmailAdapter } from "src/features/auth-main/infrastructure/adapters/email.adapter"
import { TokensService } from "src/features/auth-main/infrastructure/services/tokens.service"
import { ConfigType } from "src/features/auth-main/infrastructure/settings/configuration"
import { PASSWORD_HASH_EXPIRES_TIME, Secrets } from "src/features/auth-main/infrastructure/utils/constants"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"


export class PasswordRecoverySqlCommandCopy {
  constructor(public email: string) {
  }
}

@CommandHandler(PasswordRecoverySqlCommandCopy)
export class PasswordRecoverySqlCopy implements ICommandHandler<PasswordRecoverySqlCommandCopy> {
  constructor(
    protected tokensService: TokensService,
    protected emailAdapter: EmailAdapter,
    protected configService: ConfigService<ConfigType, true>,
    protected authSqlRepository: AuthRepositoryOrmCopy,
  ) {
  }

  async execute(command: PasswordRecoverySqlCommandCopy): Promise<Contract<null | boolean>> {

    // if (oldRecoveryCode === null) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
    // const passwordHashExpiresTime = this.configService.get(PASSWORD_HASH_EXPIRES_TIME, { infer: true })

    const recoveryCode = await this.authSqlRepository.findLastRecoveryCodeByEmail(command.email)
    if (recoveryCode !== null) await this.authSqlRepository.deactivatePasswordRecoveryCode(recoveryCode.recoveryCodeId)

    const newPasswordRecoveryCode = await this.tokensService.createToken(
      { email: command.email },
      passwordRecoveryCodeSecret,
      PASSWORD_HASH_EXPIRES_TIME
    )

    const newRecoveryCode = await this.authSqlRepository.createPasswordRecoveryCode({
      email: command.email,
      recoveryCode: newPasswordRecoveryCode,
      active: true,
    })
    console.log("newRecoveryCode", newRecoveryCode)
    // SENDING PASSWORD RECOVERY ↓↓↓
    this.emailAdapter.sendPasswordRecovery(newRecoveryCode.email, newRecoveryCode.recoveryCode)
    // if (!isSend) {
    //   const deletedResult = await this.authSqlRepository.deletePasswordRecoveryCode(newRecoveryCode.id)
    //   if (deletedResult.deletedCount === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)
    //   return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    // }

    return new Contract(true, null)
  }


}