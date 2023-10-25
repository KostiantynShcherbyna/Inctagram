import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class ConfirmationBodyInputModel {
	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'code'))
	@IsString()
	@IsNotEmpty()
	code: string
}
