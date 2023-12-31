import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PostImage, PrismaClient } from '@prisma/client'
import { UsersRepository } from '../../../users/rep/users.repository'

export class CreatePostCommand {
	constructor(
		public userId: string,
		public description: string
	) {
	}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
	implements ICommandHandler<CreatePostCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: CreatePostCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null) return ErrorEnum.NOT_FOUND

		const post = await this.prismaClient.post.create({
			data: {
				description: command.description,
				userId: command.userId
			}
		})

		const postImages = await this.prismaClient.postImage.findMany({
			where: { userId: command.userId, postId: post.id }
		})

		const postImagesView = postImages ? this.mapPostImages(postImages) : []

		return {
			id: post.id,
			description: post.description,
			images: postImagesView,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			userId: command.userId
		}
	}

	private mapPostImages(postImages: PostImage[]) {
		return postImages.map(image => {
			return {
				// url: image.uploadPath,
				width: image.width,
				height: image.height,
				size: image.size,
				id: image.id
			}
		})
	}

}