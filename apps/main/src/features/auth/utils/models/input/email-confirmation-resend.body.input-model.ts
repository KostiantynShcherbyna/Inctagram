import { IsEmail, IsString, Matches } from 'class-validator'
import { EMAIL_REGISTRATION_REGEX } from '../../../../../../../infrastructure/utils/constants'
import { Transform } from 'class-transformer'
import { trimTransformer } from '../../../../../../../infrastructure/utils/trim-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class EmailConfirmationResendBodyInputModel {
	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'email'))
	@IsString()
	@IsEmail()
	@Matches(EMAIL_REGISTRATION_REGEX)
	email: string
}
