import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class LoginBodyInputModel {
	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'loginOrEmail'))
	@IsNotEmpty()
	@IsString()
	loginOrEmail: string

	@ApiProperty()
	@Transform(({ value }) => trimTransformer(value, 'password'))
	@IsNotEmpty()
	@IsString()
	password: string
}
