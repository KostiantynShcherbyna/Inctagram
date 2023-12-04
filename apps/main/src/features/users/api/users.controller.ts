import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
	Param,
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
import { UploadAvatarPipe } from '../../../infrastructure/middlewares/users/upload-avatar.pipe'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { UpdateProfileBodyInputModel } from '../utils/models/input/update-profile.body.input-model'
import { UpdateProfileCommand } from '../app/use-cases/update-profile.use-case'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { UsersQueryRepository } from '../rep/users.query.repository'
import { UsersRepository } from '../rep/users.repository'
import { RefreshGuard } from '../../../infrastructure/middlewares/auth/guards/refresh.guard'

@Injectable()
@Controller('users')
export class UsersController {
	constructor(
		protected commandBus: CommandBus,
		@Inject('MEDIA_MICROSERVICE') private clientProxy: ClientProxy,
		private usersQueryRepository: UsersQueryRepository,
		private usersRepository: UsersRepository
	) {
	}

	// @UseGuards(AccessGuard)
	@Get('profile/:id')
	async getProfile(
		@Param() param: { id: string },
		// @DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel
	) {
		// if (id !== deviceSession.userId)
		// 	throw new UnauthorizedException()
		return await this.usersQueryRepository.findProfile(param.id)
	}

	@UseGuards(AccessGuard)
	@Put('profile')
	async updateProfile(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: UpdateProfileBodyInputModel
	) {
		const updateResult = await this.commandBus
			.execute(new UpdateProfileCommand(deviceSession.userId, body))

		if (updateResult === ErrorEnum.USER_NOT_FOUND)
			throw new NotFoundException()
		return updateResult
	}

	@UseGuards(RefreshGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete('profile')
	async deleteProfile(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel
	) {
		const updateResult = await this.usersRepository.deleteUser(deviceSession.userId)
		if (!updateResult) throw new NotFoundException()
		return updateResult
	}


	@UseGuards(AccessGuard)
	@Post('profile/avatar')
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadAvatarPipe) file: Express.Multer.File
	) {
		try {
			return await lastValueFrom(this.clientProxy.send<any>(
				{ cmd: 'uploadAvatar' },
				{ userId: deviceSession.userId, file }
			))
		} catch (err) {
			if (err.message === ErrorEnum.USER_NOT_FOUND)
				throw new NotFoundException()
		}
	}

	@UseGuards(AccessGuard)
	@Delete('profile/avatar')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteAvatar(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel
	) {
		try {
			return await lastValueFrom(this.clientProxy.send<any>(
				{ cmd: 'deleteAvatar' }, deviceSession.userId
			))
		} catch (err) {
			if (err.message === ErrorEnum.AVATAR_NOT_FOUND)
				throw new NotFoundException()
		}
	}


}
