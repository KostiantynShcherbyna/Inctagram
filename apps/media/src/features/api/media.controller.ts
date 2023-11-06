import { Controller, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSessionGuard } from '../../../../main/src/infrastructure/middlewares/auth/guards/device-session.guard'
import {
	DeviceSessionHeaderInputModel
} from '../../../../main/src/features/posts/utils/models/input/device-session.header.input-model'
import { UploadPostImagePipe } from '../../../../main/src/infrastructure/middlewares/users/upload-post-image.pipe'
import { CommandBus } from '@nestjs/cqrs'
import { UploadPostImageCommand } from '../../../../main/src/features/posts/app/use-cases/upload-post-image.use.case'
import { ErrorEnum } from '../../../../main/src/infrastructure/utils/error-enum'
import { AccessGuard } from '../../infrastructure/guards/access.guard'

@Controller()
export class MediaController {
	constructor(protected commandBus: CommandBus) {
	}

	@UseGuards(AccessGuard)
	@MessagePattern({ cmd: 'uploadPostImage' })
	@UseInterceptors(FileInterceptor('file'))
	async uploadPostImage(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadPostImagePipe) file: Express.Multer.File
	) {
		const uploadResult = await this.commandBus
			.execute(new UploadPostImageCommand(deviceSession.userId, file))

		if (uploadResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return uploadResult
	}

}