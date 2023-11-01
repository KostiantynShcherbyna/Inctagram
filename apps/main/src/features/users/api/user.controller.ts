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
	ServiceUnavailableException,
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
import { PhotoNormalTypes } from '../../../infrastructure/utils/constants'
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
export class UserController {
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
		const fillResult = await this.commandBus.execute(
			new FillProfileCommand(deviceSession.userId,
				{
					username: body.login,
					firstname: body.firstname,
					lastname: body.lastname,
					birthDate: body.birthDate,
					city: body.city,
					aboutMe: body.aboutMe
				},
				{
					originalname: file.originalname,
					buffer: file.buffer,
					mimetype: file.mimetype as PhotoNormalTypes
				}
			)
		)

		if (fillResult.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (fillResult.error === ErrorEnum.EXCEPTION)
			throw new ServiceUnavailableException()

		return fillResult.data
	}

	@UseGuards(AccessGuard)
	@Put('edit-profile')
	async editProfile(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: EditProfileBodyInputModel
	) {
		const editResult = await this.commandBus.execute(
			new EditProfileCommand(deviceSession.userId, {
				username: body.username,
				firstname: body.firstname,
				lastname: body.lastname,
				birthDate: body.birthDate,
				city: body.city,
				aboutMe: body.aboutMe
			})
		)

		if (editResult.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (editResult.error === ErrorEnum.EXCEPTION)
			throw new ServiceUnavailableException()

		return editResult.data
	}

	@UseGuards(AccessGuard)
	@Post('images/photo')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UserPhotoUploadPipe) file: Express.Multer.File
	) {
		console.log('file', file)
		const uploadResult = await this.commandBus.execute(
			new UploadPhotoCommand(
				deviceSession.userId,
				file.originalname,
				file.buffer,
				file.mimetype as PhotoNormalTypes
			)
		)
		if (uploadResult.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		return uploadResult.data
	}

	@UseGuards(AccessGuard)
	@Delete('images/photo')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseInterceptors(FileInterceptor('file'))
	async deletePhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: DeletePhotoBodyInputModel
	) {
		const deleteResult = await this.commandBus.execute(
			new DeletePhotoCommand(deviceSession.userId, body.photoToken)
		)

		if (deleteResult.error === ErrorEnum.NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.PHOTO_NOT_FOUND, 'photoId'))
		if (deleteResult.error === ErrorEnum.FORBIDDEN)
			throw new ForbiddenException()
	}


}
