import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PhotoIdParamInputModelSql {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@IsUUID()
	photoId: string
}
