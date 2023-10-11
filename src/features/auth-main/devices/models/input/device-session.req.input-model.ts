import { IsDate, IsNotEmpty, IsString } from "class-validator"

export class DeviceSessionReqInputModel {
  @IsString()
  @IsNotEmpty()
  ip: string

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  lastActiveDate: string

  @IsString()
  @IsNotEmpty()
  deviceId: string

  @IsString()
  @IsNotEmpty()
  userId: string

  @IsDate()
  @IsNotEmpty()
  expireAt: Date
}