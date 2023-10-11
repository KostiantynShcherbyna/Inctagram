import { DevicesDocument } from "src/features/devices/application/entites/mongoose/devices.schema"

export type RefreshDeviceDto = {
    deviceIp: string
    userAgent: string
    device: DevicesDocument,
    accessJwtSecret: string,
    refreshJwtSecret: string,
}