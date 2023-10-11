
export interface CreateDeviceDto {
  deviceIp: string
  userAgent: string
  userId: string
  accessJwtSecret: string
  refreshJwtSecret: string
  DevicesModel: unknown
}