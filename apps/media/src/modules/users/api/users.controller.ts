import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { UploadAvatarCommand } from '../app/use-cases/upload-avatar.use-case'
import { DeleteAvatarCommand } from '../app/use-cases/delete-avatar.use-case'

@Controller()
export class UsersController {
	constructor(protected commandBus: CommandBus) {
	}

	@MessagePattern({ cmd: 'uploadAvatar' })
	async uploadAvatar(@Payload() data: { userId: string, file: any }) {
		return await this.commandBus
			.execute(new UploadAvatarCommand(data.userId, data.file))
	}

	@MessagePattern({ cmd: 'deleteAvatar' })
	async deleteAvatar(@Payload() userId: string) {
		return await this.commandBus.execute(new DeleteAvatarCommand(userId))
	}


}