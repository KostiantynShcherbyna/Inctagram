import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'

export class LoginBodyInputModel {
	@Transform(({ value }) => trimTransformer(value, 'loginOrEmail'))
	@IsNotEmpty()
	@IsString()
	loginOrEmail: string

	@Transform(({ value }) => trimTransformer(value, 'password'))
	@IsNotEmpty()
	@IsString()
	password: string
}
