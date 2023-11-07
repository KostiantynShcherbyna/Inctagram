import {
	Body,
	Controller,
	Delete,
	HttpCode,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	Post,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSessionGuard } from '../../../infrastructure/middlewares/auth/guards/device-session.guard'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input.model'
import { AccessGuard } from '../../../infrastructure/middlewares/auth/guards/access.guard'
import { UploadAvatarPipe } from '../../../infrastructure/middlewares/users/upload-avatar.pipe'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { UpdateProfileBodyInputModel } from '../utils/models/input/update-profile.body.input-model'
import { DeleteAvatarCommand } from '../app/use-cases/delete-avatar.use-case'
import { UpdateProfileCommand } from '../app/use-cases/update-profile.use-case'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

@Injectable()
@Controller('users')
export class UsersController {
	constructor(
		protected commandBus: CommandBus,
		@Inject('MEDIA_MICROSERVICE') private clientProxy: ClientProxy
	) {
	}

	@UseGuards(AccessGuard)
	@Put('profile')
	async updateProfile(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: UpdateProfileBodyInputModel
	) {
		const updateResult = await this.commandBus
			.execute(new UpdateProfileCommand(deviceSession.userId, body))

		if (updateResult === ErrorEnum.NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		return updateResult
	}

	// @UseGuards(AccessGuard)
	// @Post('profile/avatar')
	// @UseInterceptors(FileInterceptor('file'))
	// async uploadAvatar(
	// 	@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
	// 	@UploadedFile(UploadAvatarPipe) file: Express.Multer.File
	// ) {
	// 	const uploadResult = await this.commandBus
	// 		.execute(new UploadAvatarCommand(deviceSession.userId, file))
	//
	// 	if (uploadResult === ErrorEnum.NOT_FOUND)
	// 		throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
	// 	return uploadResult
	// }

	@UseGuards(AccessGuard)
	@Delete('profile/media')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePhoto(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel
	) {
		const deleteResult = await this.commandBus
			.execute(new DeleteAvatarCommand(deviceSession.userId))

		if (deleteResult === ErrorEnum.NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
	}


	@UseGuards(AccessGuard)
	@Post('profile/avatar')
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadAvatarPipe) file: Express.Multer.File
	) {

		const uploadResult = await firstValueFrom(this.clientProxy.send<string>(
			{ cmd: 'uploadAvatar' },
			{ userId: deviceSession.userId, file }
		))
		if (uploadResult === ErrorEnum.NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		return uploadResult
	}

}
