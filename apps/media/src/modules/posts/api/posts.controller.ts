import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { UploadPostImageCommand } from '../app/use-cases/upload-post-image.use.case'
import { DeletePostImageCommand } from '../app/use-cases/delete-post-image.use-case'

@Controller()
export class PostsController {
	constructor(protected commandBus: CommandBus) {
	}

	@MessagePattern({ cmd: 'uploadPostImage' })
	async uploadPostImage(@Payload() data: any) {
		// return await this.commandBus
		// 	.execute(new UploadPostImageCommand(data.userId, data.file)) // TODO postId
	}

	@MessagePattern({ cmd: 'deletePostImage' })
	async deletePostImage(@Payload() data: any) {
		return await this.commandBus
			.execute(new DeletePostImageCommand(data.userId, data.imageId))
	}


}