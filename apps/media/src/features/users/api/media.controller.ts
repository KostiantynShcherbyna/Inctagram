import { Controller } from '@nestjs/common'
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { UploadAvatarCommand } from '../app/use-cases/upload-avatar.use-case'
import { UploadPostImageCommand } from '../app/use-cases/upload-post-image.use.case'

@Controller()
export class MediaController {
	constructor(protected commandBus: CommandBus) {
	}

	@MessagePattern({ cmd: 'uploadPostImage' })
	async uploadPostImage(@Payload() data: any) {
		const uploadResult = await this.commandBus
			.execute(new UploadPostImageCommand(data.userId, data.file))
		if (uploadResult === ErrorEnum.NOT_FOUND)
			throw new RpcException(ErrorEnum.NOT_FOUND)
		return uploadResult
	}


	@MessagePattern({ cmd: 'uploadAvatar' })
	async uploadAvatar(@Payload() data: any) {
		const uploadResult = await this.commandBus
			.execute(new UploadAvatarCommand(data.userId, data.file))
		if (uploadResult === ErrorEnum.NOT_FOUND)
			throw new RpcException(ErrorEnum.NOT_FOUND)
		return uploadResult
	}


}