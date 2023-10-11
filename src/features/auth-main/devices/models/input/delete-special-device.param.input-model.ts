import { IsString, IsUUID } from "class-validator"

export class DeleteSpecialDeviceParamInputModel {
  @IsString()
  @IsUUID()
  deviceId: string
}
