import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient } from '@prisma/client'
import { UsersRepository } from '../../../users/rep/users.repository'

export class UpdatePostCommand {
	constructor(
		public userId: string,
		public postId: string,
		public description: string
	) {
	}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
	implements ICommandHandler<UpdatePostCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: UpdatePostCommand) {
		const user = await this.prismaClient.user
			.findUnique({ where: { id: command.userId } })
		if (!user) return ErrorEnum.USER_NOT_FOUND

		const post = await this.prismaClient.post
			.findUnique({ where: { id: command.postId } })
		if (!post) return ErrorEnum.NOT_FOUND
		if (post.userId !== command.userId) return ErrorEnum.FORBIDDEN

		await this.prismaClient.post.update({
			where: { id: command.postId, userId: command.userId },
			data: { description: command.description }
		})

		return true
	}

}