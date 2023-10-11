import { DevicesModel } from "src/features/devices/application/entites/mongoose/devices.schema"

export interface CreateDeviceDto {
  deviceIp: string
  userAgent: string
  userId: string
  accessJwtSecret: string
  refreshJwtSecret: string
  DevicesModel: DevicesModel
}