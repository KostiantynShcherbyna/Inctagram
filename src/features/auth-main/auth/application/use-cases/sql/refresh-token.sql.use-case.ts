import { DeviceSessionReqInputModel } from "../../../api/models/input/device-session.req.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConfigService, ConfigType } from "@nestjs/config"
import { RefreshTokenOutputModel } from "../../../api/models/output/refresh-token.output-model"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { addSeconds } from "date-fns"
import { DevicesRepositoryOrm } from "../../../../devices/repository/typeorm/devices.repository.orm"
import { TokensService } from "src/features/auth-main/infrastructure/services/tokens.service"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"
import { ACCESS_EXPIRES_TIME, EXPIRE_AT_ACCESS, REFRESH_EXPIRES_TIME, Secrets } from "src/features/auth-main/infrastructure/utils/constants"


export class RefreshTokenSqlCommandCopy {
  constructor(public deviceSession: DeviceSessionReqInputModel, public deviceIp: string, public userAgent: string) {
  }
}

@CommandHandler(RefreshTokenSqlCommandCopy)
export class RefreshTokenSqlCopy implements ICommandHandler<RefreshTokenSqlCommandCopy> {
  constructor(
    protected configService: ConfigService<ConfigType<any>, true>,
    protected devicesSqlRepository: DevicesRepositoryOrm,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected tokensService: TokensService,
  ) {
  }

  async execute(command: RefreshTokenSqlCommandCopy): Promise<Contract<null | RefreshTokenOutputModel>> {

    const user = await this.usersSqlRepository.findUserByUserId(command.deviceSession.userId)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceSession.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.deviceSession.lastActiveDate !== device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })

    const newIssueAt = new Date(Date.now())

    const tokensPayload = {
      userId: device.userId,
      ip: command.deviceIp,
      title: command.userAgent,
      deviceId: device.deviceId,
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

    await this.devicesSqlRepository.updateActiveDate({
      deviceId: tokensPayload.deviceId,
      lastActiveDate: tokensPayload.lastActiveDate,
      expireAt: tokensPayload.expireAt.toString()
    })

    return new Contract({ accessJwt: { accessToken }, refreshToken }, null)
  }


}