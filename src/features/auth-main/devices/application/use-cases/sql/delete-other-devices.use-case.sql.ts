import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { DevicesRepositoryOrm } from "../../../repository/typeorm/devices.repository.orm"
import {Contract} from "../../../../infrastructure/utils/contract";
import {ErrorEnums} from "../../../../infrastructure/utils/error-enums";


export class DeleteOtherDevicesCommandSql {
  constructor(
    public userId: string,
    public deviceId: string
  ) {
  }
}


@CommandHandler(DeleteOtherDevicesCommandSql)
export class DeleteOtherDevicesSql implements ICommandHandler<DeleteOtherDevicesCommandSql> {
  constructor(
    protected devicesSqlRepository: DevicesRepositoryOrm,
  ) {
  }

  async execute(command: DeleteOtherDevicesCommandSql): Promise<Contract<null | boolean>> {

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

    const deleteCount = await this.devicesSqlRepository.deleteOtherDevices({
      userId: command.userId,
      deviceId: command.deviceId
    })
    if (deleteCount === null) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

    return new Contract(true, null)
  }

}