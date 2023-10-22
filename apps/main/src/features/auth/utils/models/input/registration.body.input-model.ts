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

export class RegistrationBodyInputModel {
	@Transform(({ value }) => trimTransformer(value, 'login'))
	@IsString()
	@Length(LOGIN_MIN_LENGTH, LOGIN_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	login: string

	@Transform(({ value }) => trimTransformer(value, 'password'))
	@IsString()
	@Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
	password: string

	@Transform(({ value }) => trimTransformer(value, 'email'))
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	@Matches(EMAIL_REGISTRATION_REGEX)
	email: string
}
