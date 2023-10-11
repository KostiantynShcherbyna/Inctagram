import { DevicesDocument, } from "src/features/devices/application/entites/mongoose/devices.schema"

export interface CreateDeviceTokensDto {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}