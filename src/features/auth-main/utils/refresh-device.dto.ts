
export type RefreshDeviceDto = {
    deviceIp: string
    userAgent: string
    device: unknown,
    accessJwtSecret: string,
    refreshJwtSecret: string,
}