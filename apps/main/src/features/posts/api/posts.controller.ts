import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Inject,
	Param,
	Post,
	Put,
	Query,
	Res,
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
import { DeletePostImageUriInputModel } from '../utils/models/input/delete-post-image.uri.input-model'
import { CreatePostBodyInputModel } from '../utils/models/input/create-post.body.input-model'
import { CreatePostCommand } from '../app/use-cases/create-post.use.case'
import { UpdatePostUriInputModel } from '../utils/models/input/update-post.uri.input-model'
import { UpdatePostCommand } from '../app/use-cases/update-post.use.case'
import { ClientProxy } from '@nestjs/microservices'
import { UploadPostImagePipe } from '../../../infrastructure/middlewares/users/upload-post-image.pipe'
import { PostsQueryRepository } from '../rep/posts.repository'
import { AccessMiddleware } from '../../../infrastructure/middlewares/auth/guards/access-middleware.guard'
import { DeviceSessionOptionalHeaderInputModel } from '../utils/models/input/device-session-optional.header.input-model'
import { GetPostsUriInputModel } from '../utils/models/input/get-posts.uri.input-model'
import { Response } from 'express'

@Controller('posts')
export class PostsController {
	constructor(
		protected commandBus: CommandBus,
		protected postsQueryRepository: PostsQueryRepository,
		@Inject('MEDIA_MICROSERVICE') private clientProxy: ClientProxy
	) {
	}

	@UseGuards(AccessMiddleware)
	@Get()
	async getPosts(
		@Res() res: Response,
		@DeviceSessionGuard() deviceSession: DeviceSessionOptionalHeaderInputModel,
		@Query() queryPost: GetPostsUriInputModel
	) {
		const result = await this.postsQueryRepository
			.findPosts(queryPost, deviceSession.userId)
		res.header('X-Cursor', result.cursor)
		return {
			pageSize: result.pageSize,
			totalCount: result.totalCount,
			items: result.items
		}
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
	@Post('image')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseInterceptors(FileInterceptor('file'))
	async uploadPostImage(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@UploadedFile(UploadPostImagePipe) file: Express.Multer.File
	) {
		try {
			return this.clientProxy.send<any>(
				{ cmd: 'uploadPostImage' },
				{ userId: deviceSession.userId, file }
			)
		} catch (err) {
			if (err.message === ErrorEnum.NOT_FOUND)
				throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		}
	}

	@UseGuards(AccessGuard)
	@Delete('image/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePostImage(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Param() param: DeletePostImageUriInputModel
	) {
		try {
			return this.clientProxy.send<any>(
				{ cmd: 'deletePostImage' },
				{ userId: deviceSession.userId, imageId: param.id }
			)
		} catch (err) {
			if (err.message === ErrorEnum.USER_NOT_FOUND)
				throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
			if (err.message === ErrorEnum.POST_NOT_FOUND)
				throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
			if (err.message === ErrorEnum.FORBIDDEN)
				throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		}
	}


}
