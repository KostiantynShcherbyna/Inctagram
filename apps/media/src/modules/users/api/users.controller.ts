import { Controller } from '@nestjs/common'
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { UploadAvatarCommand } from '../app/use-cases/upload-avatar.use-case'

@Controller()
export class UsersController {
	constructor(protected commandBus: CommandBus) {
	}

	@MessagePattern({ cmd: 'uploadAvatar' })
	async uploadAvatar(@Payload() data: any) {
		console.log('data', data)
		const uploadResult = await this.commandBus
			.execute(new UploadAvatarCommand(data.userId, data.file))
		if (uploadResult === ErrorEnum.NOT_FOUND)
			throw new RpcException(ErrorEnum.NOT_FOUND)
		return uploadResult
	}


}