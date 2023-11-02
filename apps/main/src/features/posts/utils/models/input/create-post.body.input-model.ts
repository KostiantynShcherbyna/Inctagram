import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'
import { Transform } from 'class-transformer'

export class CreatePostBodyInputModel {
	@Transform(({ value }) => trimTransformer(value, 'description'))
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	description: string
}