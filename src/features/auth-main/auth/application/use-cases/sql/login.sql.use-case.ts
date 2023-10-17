import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { LoginBodyInputModel } from "../../../api/models/input/login.body.input-model"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { addSeconds } from "date-fns"
import { randomUUID } from "crypto"
import { ConfigType } from "src/features/auth-main/infrastructure/settings/configuration"
import { DevicesRepositoryOrm } from "src/features/auth-main/devices/repository/typeorm/devices.repository.orm"
import { TokensService } from "src/features/auth-main/infrastructure/services/tokens.service"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"
import { LoginOutputModel } from "src/features/auth-main/auth/api/models/output/login.output-model"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"
import { compareHashManager } from "src/features/auth-main/infrastructure/services/compare-hash.service"
import { ACCESS_EXPIRES_TIME, EXPIRE_AT_ACCESS, REFRESH_EXPIRES_TIME, Secrets } from "src/features/auth-main/infrastructure/utils/constants"

export class LoginSqlCommandCopy {
  constructor(
    public loginBody: LoginBodyInputModel,
    public deviceIp: string,
    public userAgent: string
  ) {
  }
}

@CommandHandler(LoginSqlCommandCopy)
export class LoginSqlCopy implements ICommandHandler<LoginSqlCommandCopy> {
  constructor(
    protected configService: ConfigService<ConfigType, true>,
    protected devicesSqlRepository: DevicesRepositoryOrm,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected tokensService: TokensService,
  ) {
  }

  async execute(command: LoginSqlCommandCopy): Promise<Contract<null | LoginOutputModel>> {
    // ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
    const user = await this.usersSqlRepository.findUserByLoginOrEmail({
      login: command.loginBody.loginOrEmail,
      email: command.loginBody.loginOrEmail
    })
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.isBanned === true) return new Contract(null, ErrorEnums.USER_IS_BANNED)

    if (user.isConfirmed === false)
      return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
    if (await compareHashManager(user.passwordHash, command.loginBody.password) === false)
      return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)
    // ↑↑↑

    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })

    const newIssueAt = new Date(Date.now())

    const tokensPayload = {
      deviceId: randomUUID(),
      ip: command.deviceIp,
      title: command.userAgent,
      userId: user.userId,
      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_ACCESS)
    }
    const accessToken = await this.tokensService.createToken(
      tokensPayload,
      accessJwtSecret,
      ACCESS_EXPIRES_TIME
    )
    const refreshToken = await this.tokensService.createToken(
      tokensPayload,
      refreshJwtSecret,
      REFRESH_EXPIRES_TIME
    )

    await this.devicesSqlRepository.createDevice({ ...tokensPayload, expireAt: tokensPayload.expireAt.toString() })

    return new Contract({ accessJwt: { accessToken }, refreshToken }, null)
  }


}