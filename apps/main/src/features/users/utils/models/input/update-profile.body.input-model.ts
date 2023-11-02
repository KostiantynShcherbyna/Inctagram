import { Transform } from 'class-transformer'
import { IsDateString, IsOptional, IsString, Length, Matches, MaxLength, Validate } from 'class-validator'
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
import { BirthDateValidator } from '../../../../../infrastructure/middlewares/users/birth-date.validator'
import { CityValidator } from '../../../../../infrastructure/middlewares/users/city.validator'

export class UpdateProfileBodyInputModel {
	@ApiProperty({
		maxLength: LOGIN_MAX_LENGTH,
		minLength: LOGIN_MIN_LENGTH,
		pattern: '^[a-zA-Z0-9_-]*$'
	})
	@Transform(({ value }) => trimTransformer(value, 'login'))
	@IsString()
	@Length(LOGIN_MIN_LENGTH, LOGIN_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	login: string

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
	@IsOptional()
	@IsDateString()
	@Validate(BirthDateValidator)
	dateOfBirth: string

	@ApiProperty()
	@IsOptional()
	@Transform(({ value }) => trimTransformer(value, 'city'))
	@IsString()
	@Validate(CityValidator)
	city: string

	@ApiProperty({
		maxLength: ABOUT_ME_MAX_LENGTH,
		pattern: '^[a-zA-Z0-9_-]*$'
	})
	@IsOptional()
	@Transform(({ value }) => trimTransformer(value, 'aboutMe'))
	@IsString()
	@MaxLength(ABOUT_ME_MAX_LENGTH)
	@Matches(LOGIN_REGEX)
	aboutMe: string

}
