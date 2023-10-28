import { Transform } from 'class-transformer'
import { IsDateString, IsString, Length, Matches, MaxLength, Validate } from 'class-validator'
import {
	ABOUT_ME_MAX_LENGTH,
	FIRSTNAME_MAX_LENGTH,
	FIRSTNAME_MIN_LENGTH,
	LASTNAME_MAX_LENGTH,
	LASTNAME_MIN_LENGTH,
	LOGIN_MAX_LENGTH,
	LOGIN_MIN_LENGTH,
	LOGIN_REGEX
} from '../../../../../infrastructure/utils/constants'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BirthDateValidator } from '../../validators/birth-date.validator'

export class FillProfileBodyInputModel {
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
		maxLength: FIRSTNAME_MAX_LENGTH,
		minLength: FIRSTNAME_MIN_LENGTH,
		pattern: '^[a-zA-Z0-9_-]*$'
	})
	@Transform(({ value }) => trimTransformer(value, 'firstname'))
	@IsString()
	@Length(FIRSTNAME_MIN_LENGTH, FIRSTNAME_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	firstname: string

	@ApiProperty({
		maxLength: LASTNAME_MAX_LENGTH,
		minLength: LASTNAME_MIN_LENGTH,
		pattern: '^[a-zA-Z0-9_-]*$'
	})
	@Transform(({ value }) => trimTransformer(value, 'lastname'))
	@IsString()
	@Length(LASTNAME_MIN_LENGTH, LASTNAME_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	lastname: string

	@ApiProperty()
	@IsDateString()
	@Validate(BirthDateValidator)
	birthDate: string

	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'city'))
	@IsString()
	city: string

	@ApiProperty({
		maxLength: ABOUT_ME_MAX_LENGTH,
		pattern: '^[a-zA-Z0-9_-]*$'
	})
	@Transform(({ value }) => trimTransformer(value, 'aboutMe'))
	@IsString()
	@MaxLength(ABOUT_ME_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	aboutMe: string

}
