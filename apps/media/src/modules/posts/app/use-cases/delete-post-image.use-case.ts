import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { PostImage, PrismaClient } from '@prisma/client'
import { RpcException } from '@nestjs/microservices'
import { FirebaseAdapter } from '../../../../infrastructure/adapters/firebase.adapter'

export class DeletePostImageCommand {
	constructor(public userId: string, public imageId: string) {
	}
}


@CommandHandler(DeletePostImageCommand)
export class DeletePostImageUseCase implements ICommandHandler<DeletePostImageCommand> {
	constructor(
		protected firebaseAdapter: FirebaseAdapter,
		protected base64Service: Base64Service,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: DeletePostImageCommand) {
		const user = await this.prismaClient.user
			.findUnique({ where: { id: command.userId } })
		if (!user) return ErrorEnum.USER_NOT_FOUND

		const postImage = await this.prismaClient.postImage
			.findUnique({ where: { id: command.imageId } })
		if (!postImage) throw new RpcException(ErrorEnum.POST_NOT_FOUND)
		const checkResult = await this.checkCredentials(command.userId, postImage)
		if (checkResult === ErrorEnum.FORBIDDEN)
			throw new RpcException(ErrorEnum.FORBIDDEN)
		if (checkResult === ErrorEnum.POST_NOT_FOUND)
			throw new RpcException(ErrorEnum.POST_NOT_FOUND)

		await this.deletePostImage(postImage)
		return
	}

	private async checkCredentials(userId: string, postImage: PostImage) {
		if (postImage.userId !== userId) return ErrorEnum.FORBIDDEN

		const postImagePath = await this.base64Service
			.decodePostImagePath(postImage.path)

		const imageSplitResult = postImagePath.split(' ')
		// Take a second part is postId
		const post = await this.prismaClient.post
			.findUnique({ where: { id: imageSplitResult[1] } })
		if (!post) return ErrorEnum.POST_NOT_FOUND
		return post.userId !== userId ? ErrorEnum.FORBIDDEN : true

	}

	private async deletePostImage(postImage: PostImage) {
		return this.prismaClient.$transaction(async (tx) => {
			await tx.avatar.delete({ where: { id: postImage.id } })
			await this.firebaseAdapter
				.delete(`post-images/${postImage.path}`)
		})
	}


}