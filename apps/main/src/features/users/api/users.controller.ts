import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	HttpCode,
	HttpStatus,
	Injectable,
	Post,
	Put,
	UnauthorizedException,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSessionGuard } from '../../../infrastructure/middlewares/auth/guards/device-session.guard'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input.model'
import { AccessGuard } from '../../../infrastructure/middlewares/auth/guards/access.guard'
import { UserPhotoUploadPipe } from '../../../infrastructure/middlewares/users/user-photo-upload.pipe'
import { UploadPhotoCommand } from '../app/use-cases/upload-photo.use.case'
import { FillProfileCommand } from '../app/use-cases/fill-profile.use-case'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { FillProfileBodyInputModel } from '../utils/models/input/fill-profile.body.input-model'
import { DeletePhotoBodyInputModel } from '../utils/models/input/delete-photo.body.input-model'
import { DeletePhotoCommand } from '../app/use-cases/delete-photo.use-case'
import { outputMessageException } from '../../../infrastructure/utils/output-message-exception'
import { EditProfileBodyInputModel } from '../utils/models/input/edit-profile.body.input-model'
import { EditProfileCommand } from '../app/use-cases/edit-profile.use-case'

@Injectable()
@Controller('users')
export class UsersController {
	constructor(protected commandBus: CommandBus) {
	}

	@UseGuards(AccessGuard)
	@Post('fill-profile')
	@UseInterceptors(FileInterceptor('file'))
	async fillProfile(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UserPhotoUploadPipe) file: Express.Multer.File,
		@Body() body: FillProfileBodyInputModel
	) {
		console.log('file', file)
		const fillResult = await this.commandBus
			.execute(new FillProfileCommand(deviceSession.userId, body, file))

		if (fillResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return fillResult
	}

	@UseGuards(AccessGuard)
	@Put('edit-profile')
	async editProfile(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: EditProfileBodyInputModel
	) {
		const editResult = await this.commandBus
			.execute(new EditProfileCommand(deviceSession.userId, body))

		if (editResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return editResult
	}

	@UseGuards(AccessGuard)
	@Post('images/photo')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UserPhotoUploadPipe) file: Express.Multer.File
	) {
		const uploadResult = await this.commandBus
			.execute(new UploadPhotoCommand(deviceSession.userId, file))

		if (uploadResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return uploadResult
	}

	@UseGuards(AccessGuard)
	@Delete('images')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: DeletePhotoBodyInputModel
	) {
		const deleteResult = await this.commandBus
			.execute(new DeletePhotoCommand(deviceSession.userId, body.photoToken))

		if (deleteResult === ErrorEnum.NOT_FOUND) throw new BadRequestException(
			outputMessageException(ErrorEnum.PHOTO_NOT_FOUND, 'photoId'))
		if (deleteResult === ErrorEnum.FORBIDDEN) throw new ForbiddenException()
	}


}
