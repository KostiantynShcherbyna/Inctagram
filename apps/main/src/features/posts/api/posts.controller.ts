import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	Post,
	Put,
	UnauthorizedException,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { AccessGuard } from '../../../infrastructure/middlewares/auth/guards/access.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeviceSessionGuard } from '../../../infrastructure/middlewares/auth/guards/device-session.guard'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input-model'
import { CommandBus } from '@nestjs/cqrs'
import { outputMessageException } from '../../../infrastructure/utils/output-message-exception'
import { DeletePostImageCommand } from '../app/use-cases/delete-post-image.use-case'
import { DeletePostImageUriInputModel } from '../utils/models/input/delete-post-image.uri.input-model'
import { CreatePostBodyInputModel } from '../utils/models/input/create-post.body.input-model'
import { CreatePostCommand } from '../app/use-cases/create-post.use.case'
import { UpdatePostUriInputModel } from '../utils/models/input/update-post.uri.input-model'
import { UpdatePostCommand } from '../app/use-cases/update-post.use.case'
import { ClientProxy } from '@nestjs/microservices'
import { UploadPostImagePipe } from '../../../infrastructure/middlewares/users/upload-post-image.pipe'
import { UploadPostImageCommand } from '../app/use-cases/upload-post-image.use.case'

@Controller('posts')
export class PostsController {
	constructor(
		protected commandBus: CommandBus,
		@Inject('MEDIA_MICROSERVICE') private clientProxy: ClientProxy
	) {
	}

	@UseGuards(AccessGuard)
	@Post()
	async createPost(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: CreatePostBodyInputModel
	) {
		const createResult = await this.commandBus
			.execute(new CreatePostCommand(deviceSession.userId, body.description))

		if (createResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return createResult
	}

	@UseGuards(AccessGuard)
	@Put(':id')
	async updatePost(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Body() body: CreatePostBodyInputModel,
		@Param() param: UpdatePostUriInputModel
	) {
		const updateResult = await this.commandBus
			.execute(new UpdatePostCommand(deviceSession.userId, param.id, body.description))

		if (updateResult === ErrorEnum.USER_NOT_FOUND) throw new UnauthorizedException()
		if (updateResult === ErrorEnum.NOT_FOUND) throw new BadRequestException(
			outputMessageException(ErrorEnum.NOT_FOUND, 'id'))
		if (updateResult === ErrorEnum.FORBIDDEN) throw new ForbiddenException()
		return updateResult
	}

	@UseGuards(AccessGuard)
	@Post('imagee')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPostImage(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadPostImagePipe) file: Express.Multer.File
	) {
		console.log('file', file)
		const uploadResult = await this.commandBus
			.execute(new UploadPostImageCommand(deviceSession.userId, file))

		if (uploadResult === ErrorEnum.NOT_FOUND) throw new UnauthorizedException()
		return uploadResult
	}

	@UseGuards(AccessGuard)
	@Delete('image/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePostImage(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Param() param: DeletePostImageUriInputModel
	) {
		const deleteResult = await this.commandBus
			.execute(new DeletePostImageCommand(deviceSession.userId, param.id))

		if (deleteResult === ErrorEnum.USER_NOT_FOUND) throw new UnauthorizedException()
		if (deleteResult === ErrorEnum.NOT_FOUND) throw new BadRequestException(
			outputMessageException(ErrorEnum.NOT_FOUND, 'id'))
		if (deleteResult === ErrorEnum.FORBIDDEN) throw new ForbiddenException()
	}

	@UseGuards(AccessGuard)
	@Post('image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPostImageMicro(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadPostImagePipe) file: Express.Multer.File
	) {
		return this.clientProxy.send<string>(
			{ cmd: 'uploadPostImage' },
			{ userId: deviceSession.userId, file }
		)
	}


}
