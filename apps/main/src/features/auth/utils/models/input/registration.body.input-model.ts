import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator'
import {
	EMAIL_REGISTRATION_REGEX,
	LOGIN_MAX_LENGTH,
	LOGIN_MIN_LENGTH,
	LOGIN_REGEX,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH
} from '../../../../../infrastructure/utils/constants'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class RegistrationBodyInputModel {
	@ApiProperty({
		maxLength: LOGIN_MAX_LENGTH,
		minLength: LOGIN_MIN_LENGTH,
		pattern: '^[a-zA-Z0-9_-]*$'
	})
	@Transform(({ value }) => trimTransformer(value, 'username'))
	@IsString()
	@Length(LOGIN_MIN_LENGTH, LOGIN_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	username: string

	@ApiProperty({
		maxLength: PASSWORD_MAX_LENGTH,
		minLength: PASSWORD_MIN_LENGTH
	})
	@Transform(({ value }) => trimTransformer(value, 'password'))
	@IsString()
	@Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
	password: string

	@ApiProperty({
		maxLength: PASSWORD_MAX_LENGTH,
		minLength: PASSWORD_MIN_LENGTH,
		pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
	})
	@Transform(({ value }) => trimTransformer(value, 'email'))
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	@Matches(EMAIL_REGISTRATION_REGEX)
	email: string

}
