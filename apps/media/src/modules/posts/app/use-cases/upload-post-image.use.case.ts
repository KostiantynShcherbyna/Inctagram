import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { FirebaseAdapter } from '../../../../infrastructure/adapters/firebase.adapter'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { RpcException } from '@nestjs/microservices'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ICreatePostImage } from '../../../../infrastructure/types/posts.types'

export class UploadPostImageCommand {
	constructor(
		public userId: string,
		public postId: string,
		public file: Express.Multer.File
	) {
	}
}

@CommandHandler(UploadPostImageCommand)
export class UploadPostImageUseCase
	implements ICommandHandler<UploadPostImageCommand> {
	constructor(
		protected firebaseAdapter: FirebaseAdapter,
		protected prismaClient: PrismaClient,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: UploadPostImageCommand) {
		const checkResult = await this
			.checkCredentials(command.userId, command.userId)
		if (checkResult === ErrorEnum.USER_NOT_FOUND)
			throw new RpcException(ErrorEnum.USER_NOT_FOUND)
		if (checkResult === ErrorEnum.POST_NOT_FOUND)
			throw new RpcException(ErrorEnum.POST_NOT_FOUND)
		if (checkResult === ErrorEnum.FORBIDDEN)
			throw new RpcException(ErrorEnum.FORBIDDEN)

		const metadata = await sharp(command.file.buffer).metadata()
		const imageId = randomUUID()

		const path = await this.base64Service.encodePostImagePath({
			userId: command.userId,
			imageId: imageId,
			postId: imageId,
			originalname: command.file.originalname
		})

		const uploadUrl = await this.uploadPostImage({
			id: imageId,
			userId: command.userId,
			postId: command.postId,
			path: path,
			contentType: command.file.mimetype,
			width: metadata.width,
			height: metadata.height,
			size: command.file.size
		}, command.file.buffer)


		return {
			id: imageId,
			url: uploadUrl,
			width: metadata.width,
			height: metadata.height,
			size: command.file.size
		}

	}


	private async checkCredentials(userId: string, postId: string)
		: Promise<string> {
		const user = await this.prismaClient.user
			.findUnique({ where: { id: userId } })
		if (user === null) return ErrorEnum.USER_NOT_FOUND

		const post = await this.prismaClient.post
			.findUnique({ where: { id: postId } })
		if (post === null) return ErrorEnum.POST_NOT_FOUND
		if (post.userId !== userId) return ErrorEnum.FORBIDDEN
	}

	private async uploadPostImage(data: ICreatePostImage, buffer: Buffer)
		: Promise<string> {
		return this.prismaClient.$transaction(async (tx): Promise<string> => {
			const url = await this.firebaseAdapter
				.upload(`post-images/${data.path}`, buffer)
			await tx.postImage.create({ data: { ...data, url } })
			return url
		})
	}

}