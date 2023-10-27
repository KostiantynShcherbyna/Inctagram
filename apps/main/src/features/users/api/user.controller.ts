import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	HttpCode,
	HttpStatus,
	Injectable,
	Param,
	Post,
	ServiceUnavailableException,
	UnauthorizedException,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSessionPipe } from '../../../infrastructure/pipes/device-session.pipe'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input.model'
import { AccessGuard } from '../../../infrastructure/guards/access.guard'
import { UserPhotoPipe } from '../../../infrastructure/pipes/user-photo.pipe'
import { UploadPhotoS3Command } from '../app/use-cases/upload-photo.s3.use-case'
import { PhotoNormalTypes } from '../../../infrastructure/utils/constants'
import { FillProfileCommand } from '../app/use-cases/fill-profile.use-case'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { FillProfileBodyInputModel } from '../utils/models/input/fill-profile.body.input-model'
import { PhotoIdParamInputModelSql } from '../utils/models/input/photoId.param.input-model'
import { DeletePhotoS3Command } from '../app/use-cases/delete-photo.s3.use-case'
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
		@DeviceSessionPipe() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UserPhotoPipe) file: Express.Multer.File,
		@Body() body: FillProfileBodyInputModel
	) {
		console.log('file', file)
		const fillResult = await this.commandBus.execute(
			new FillProfileCommand({
				userId: deviceSession.userId,
				username: body.username,
				firstname: body.firstname,
				lastname: body.lastname,
				birthDate: body.birthDate,
				city: body.city,
				aboutMe: body.aboutMe,
				file: {
					originalname: file.originalname,
					buffer: file.buffer,
					mimetype: file.mimetype as PhotoNormalTypes
				}
			})
		)

		if (fillResult.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (fillResult.error === ErrorEnum.EXCEPTION)
			throw new ServiceUnavailableException()

		return fillResult.data
	}

	@UseGuards(AccessGuard)
	@Post('edit-profile')
	@UseInterceptors(FileInterceptor('file'))
	async editProfile(
		@DeviceSessionPipe() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: EditProfileBodyInputModel
	) {
		const editResult = await this.commandBus.execute(
			new EditProfileCommand({
				userId: deviceSession.userId,
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
		@DeviceSessionPipe() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UserPhotoPipe) file: Express.Multer.File
	) {
		console.log('file', file)
		const uploadResult = await this.commandBus.execute(
			new UploadPhotoS3Command(
				deviceSession.userId,
				file.originalname,
				file.buffer,
				file.mimetype as PhotoNormalTypes
			)
		)
		if (uploadResult.error === ErrorEnum.NOT_FOUND)
			throw new UnauthorizedException()
	}

	@UseGuards(AccessGuard)
	@Delete('images/photo/:photoId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseInterceptors(FileInterceptor('file'))
	async deletePhoto(
		@DeviceSessionPipe() deviceSession: DeviceSessionHeaderInputModel,
		@Param() param: PhotoIdParamInputModelSql
	) {
		const deleteResult = await this.commandBus.execute(
			new DeletePhotoS3Command(deviceSession.userId, param.photoId)
		)

		if (deleteResult.error === ErrorEnum.NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.PHOTO_NOT_FOUND, 'photoId'))
		if (deleteResult.error === ErrorEnum.FORBIDDEN)
			throw new ForbiddenException()
	}

}
