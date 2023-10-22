import { IsDate, IsNotEmpty, IsString } from 'class-validator'

export class DeviceSessionHeaderInputModel {
	@IsString()
	@IsNotEmpty()
	ip: string

	@IsString()
	@IsNotEmpty()
	title: string

	@IsString()
	@IsNotEmpty()
	iat: Date

	@IsString()
	@IsNotEmpty()
	id: string

	@IsString()
	@IsNotEmpty()
	userId: string

	@IsDate()
	@IsNotEmpty()
	exp: Date
}