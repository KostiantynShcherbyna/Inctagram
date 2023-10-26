import { Controller, Injectable, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSession } from '../../../infrastructure/decorators/device-session.decorator'
import { DeviceSessionInputModel } from '../utils/models/input/device-session.input-model'
import { AccessGuard } from '../../../infrastructure/guards/access.guard'
import { UserIdPhotoDecorator } from '../../../infrastructure/decorators/user-photo.decorator'
import { UploadPhotoS3Command } from '../app/use-cases/upload-photo-s3.use-case'

@Injectable()
@Controller('users')
export class UserController {
	constructor(protected commandBus: CommandBus) {
	}

	@UseGuards(AccessGuard)
	@Post('images/photos')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPhoto(
		@DeviceSession() deviceSession: DeviceSessionInputModel,
		@UploadedFile(UserIdPhotoDecorator) file: Express.Multer.File
	) {
		console.log('file', file)
		const uploadResult = await this.commandBus.execute(
			new UploadPhotoS3Command(
				deviceSession.userId,
				file.originalname,
				file.buffer
			)
		)
	}

}
