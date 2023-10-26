import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UserIdQuery {
	@IsString()
	@IsNotEmpty()
	@IsUUID()
	userId: string
}
