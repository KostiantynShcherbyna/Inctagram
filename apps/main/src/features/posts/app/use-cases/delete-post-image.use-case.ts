import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { PostImage, PrismaClient } from '@prisma/client'

export class DeletePostImageCommand {
	constructor(public userId: string, public imageId: string) {
	}
}


@CommandHandler(DeletePostImageCommand)
export class DeletePostImageUseCase implements ICommandHandler<DeletePostImageCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
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
		if (!postImage) return ErrorEnum.NOT_FOUND

		const checkResult = await this.checkCredentials(command.userId, postImage)
		if (checkResult === ErrorEnum.FORBIDDEN) return ErrorEnum.FORBIDDEN
		if (checkResult === ErrorEnum.NOT_FOUND) return ErrorEnum.NOT_FOUND

		await this.filesFirebaseAdapter.deleteAvatar(postImage.uploadPath)
		await this.prismaClient.postImage
			.delete({ where: { id: postImage.id } })
		return true
	}

	private async checkCredentials(userId: string, postImage: PostImage) {
		if (postImage.userId !== userId) return ErrorEnum.FORBIDDEN

		const postImagePath = await this.base64Service
			.decodePostImagePath(postImage.uploadPath)

		const imageSplitResult = postImagePath.split(' ')
		// Take a second part is postId
		const post = await this.prismaClient.post
			.findUnique({ where: { id: imageSplitResult[1] } })
		if (!post) return ErrorEnum.NOT_FOUND
		return post.userId !== userId ? ErrorEnum.FORBIDDEN : true

	}


}