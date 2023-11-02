import {
	BadRequestException,
	Controller,
	Delete,
	ForbiddenException,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	UnauthorizedException,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { AccessGuard } from '../../../infrastructure/middlewares/auth/guards/access.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSessionGuard } from '../../../infrastructure/middlewares/auth/guards/device-session.guard'
import { UploadAvatarPipe } from '../../../infrastructure/middlewares/users/upload-avatar.pipe'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input.model'
import { CommandBus } from '@nestjs/cqrs'
import { UploadPostImageCommand } from '../app/use-cases/upload-post-image.use.case'
import { outputMessageException } from '../../../infrastructure/utils/output-message-exception'
import { DeletePostImageCommand } from '../app/use-cases/delete-post-image.use-case'
import { DeletePostImageUriInputModel } from '../utils/models/input/delete-post-image.uri.input.model'

@Controller('posts')
export class PostsController {
	constructor(protected commandBus: CommandBus) {
	}

	@UseGuards(AccessGuard)
	@Post('image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadAvatarPipe) file: Express.Multer.File
	) {
		console.log('file', file)
		const uploadResult = await this.commandBus
			.execute(new UploadPostImageCommand(deviceSession.userId, file))

		if (uploadResult.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		return uploadResult.data
	}

	@UseGuards(AccessGuard)
	@Delete('image/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Param() param: DeletePostImageUriInputModel
	) {
		const deleteResult = await this.commandBus
			.execute(new DeletePostImageCommand(deviceSession.userId, param.id))

		if (deleteResult === ErrorEnum.NOT_FOUND) throw new BadRequestException(
			outputMessageException(ErrorEnum.NOT_FOUND, 'id'))
		if (deleteResult === ErrorEnum.FORBIDDEN) throw new ForbiddenException()
	}


}
