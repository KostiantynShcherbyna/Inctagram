import { IsNotEmpty, IsString, Length } from 'class-validator'
import { Transform } from 'class-transformer'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../../../../infrastructure/utils/constants'
import { ApiProperty } from '@nestjs/swagger'

export class NewPasswordBodyInputModel {
	@ApiProperty({
		maxLength: PASSWORD_MAX_LENGTH,
		minLength: PASSWORD_MIN_LENGTH
	})
	@Transform(({ value }) => trimTransformer(value, 'newPassword'))
	@IsString()
	@Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
	newPassword: string

	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'recoveryCode'))
	@IsString()
	@IsNotEmpty()
	recoveryCode: string
}
