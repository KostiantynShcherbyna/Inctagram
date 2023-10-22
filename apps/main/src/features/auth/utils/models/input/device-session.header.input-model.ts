import { IsDate, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class DeviceSessionHeaderInputModel {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	ip: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	title: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	lastActiveDate: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	deviceId: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	userId: string

	@ApiProperty()
	@IsDate()
	@IsNotEmpty()
	expireAt: Date
}
