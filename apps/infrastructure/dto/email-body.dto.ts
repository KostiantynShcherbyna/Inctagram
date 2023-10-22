import { IsEmail, IsString, Matches } from 'class-validator'
import { EMAIL_REGISTRATION_REGEX } from '../utils/constants'
import { ApiProperty } from '@nestjs/swagger'

export class EmailBodyDto {
	@ApiProperty()
	@IsString()
	service: string

	@ApiProperty()
	@IsString()
	user: string

	@ApiProperty()
	@IsString()
	pass: string

	@ApiProperty()
	@IsString()
	from: string

	@ApiProperty()
	@IsString()
	@IsEmail()
	@Matches(EMAIL_REGISTRATION_REGEX)
	email: string

	@ApiProperty()
	@IsString()
	subject: string

	@ApiProperty()
	@IsString()
	message: string
}
