import { Body, Controller, HttpException, UnauthorizedException } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { UploadPostImageCommand } from '../../../../main/src/features/posts/app/use-cases/upload-post-image.use.case'
import { ErrorEnum } from '../../../../main/src/infrastructure/utils/error-enum'
import { UploadAvatarCommand } from '../app/use-cases/upload-avatar.use-case'

@Controller()
export class MediaController {
	constructor(protected commandBus: CommandBus) {
	}

	@MessagePattern({ cmd: 'uploadPostImage' })
	async uploadPostImage(
		@Body() body: { userId: string, file: Express.Multer.File }
	) {
		const uploadResult = await this.commandBus
			.execute(new UploadPostImageCommand(body.userId, body.file))

		if (uploadResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return uploadResult
	}

	@MessagePattern({ cmd: 'uploadAvatar' })
	async uploadAvatar(data: any) {
		console.log('data', data)
		const uploadResult = await this.commandBus
			.execute(new UploadAvatarCommand(data.userId, data.file))
		console.log('FINISH')
		if (uploadResult === ErrorEnum.NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		return uploadResult
	}


}