import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'

export class OAuthLoginBodyInputModel {
	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'email'))
	@IsNotEmpty()
	@IsString()
	email: string

	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'username'))
	@IsNotEmpty()
	@IsString()
	username: string
}
