import { Body, Controller, UnauthorizedException, UseInterceptors } from '@nestjs/common'
import { Ctx, MessagePattern, NatsContext } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { UploadPostImageCommand } from '../../../../main/src/features/posts/app/use-cases/upload-post-image.use.case'
import { ErrorEnum } from '../../../../main/src/infrastructure/utils/error-enum'
import { FileInterceptor } from '@nestjs/platform-express'

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
	// @UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(
		@Ctx() context: NatsContext
	) {
		console.log('context', context)
		// const uploadResult = await this.commandBus
		// 	.execute(new UploadAvatarCommand(body.userId, body.file))
		//
		// if (uploadResult === ErrorEnum.NOT_FOUND)
		// 	throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		// return uploadResult
		return new Date()
	}


}