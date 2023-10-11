import { Devices, DevicesDocument, DevicesModel } from "src/features/devices/application/entites/mongoose/devices.schema"

export type RefreshDeviceTokensDto = {
    accessToken: string
    refreshToken: string
}