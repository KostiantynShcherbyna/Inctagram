import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { DevicesRepositoryOrm } from "../../../../devices/repository/typeorm/devices.repository.orm"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { Contract } from "src/features/auth-main/infrastructure/utils/contract"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"

export class LogoutSqlCommandCopy {
  constructor(
    public deviceId: string,
    public expireAt: Date,
    public ip: string,
    public lastActiveDate: string,
    public title: string,
    public userId: string
  ) {
  }
}

@CommandHandler(LogoutSqlCommandCopy)
export class LogoutSqlCopy implements ICommandHandler<LogoutSqlCommandCopy> {
  constructor(
    protected devicesSqlRepository: DevicesRepositoryOrm,
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
  }

  async execute(command: LogoutSqlCommandCopy): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUserByUserId(command.userId)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.lastActiveDate !== device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const deleteResult = await this.devicesSqlRepository.deleteDevice(command.deviceId)
    if (deleteResult === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


}