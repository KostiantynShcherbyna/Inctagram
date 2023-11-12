import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { Avatar, PrismaClient } from '@prisma/client'
import { FirebaseAdapter } from '../../../../infrastructure/adapters/firebase.adapter'
import { RpcException } from '@nestjs/microservices'

export class DeleteAvatarCommand {
	constructor(public userId: string) {
	}
}


@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase implements ICommandHandler<DeleteAvatarCommand> {
	constructor(
		protected firebaseAdapter: FirebaseAdapter,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: DeleteAvatarCommand) {
		const avatar = await this.prismaClient.avatar.findFirst(
			{ where: { userId: command.userId, active: true } })
		if (!avatar) throw new RpcException(ErrorEnum.AVATAR_NOT_FOUND)
		await this.deleteAvatar(avatar)
		return true
	}

	private async deleteAvatar(avatar: Avatar) {
		return this.prismaClient.$transaction(async (tx) => {
			await tx.avatar.delete({ where: { id: avatar.id } })
			await this.firebaseAdapter.delete(`avatars/${avatar.path}`)
		})
	}

}