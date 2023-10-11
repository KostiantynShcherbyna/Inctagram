import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { DevicesRepositoryOrm } from "../../../repository/typeorm/devices.repository.orm"


export class DeleteSpecialDeviceCommandSql {
  constructor(
    public deviceId: string,
    public userId: string
  ) {
  }
}


@CommandHandler(DeleteSpecialDeviceCommandSql)
export class DeleteSpecialDeviceSql implements ICommandHandler<DeleteSpecialDeviceCommandSql> {
  constructor(
    protected devicesSqlRepository: DevicesRepositoryOrm,
  ) {
  }

  async execute(command: DeleteSpecialDeviceCommandSql): Promise<Contract<null | boolean>> {

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (device.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_DEVICE)

    const deleteCount = await this.devicesSqlRepository.deleteDevice(command.deviceId)
    if (deleteCount === null) return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


}