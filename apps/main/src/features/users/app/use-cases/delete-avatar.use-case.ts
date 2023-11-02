import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { Avatar, PrismaClient } from '@prisma/client'

export class DeleteAvatarCommand {
	constructor(public userId: string) {
	}
}


@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase implements ICommandHandler<DeleteAvatarCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: DeleteAvatarCommand) {
		const avatar = await this.prismaClient.avatar.findFirst(
			{ where: { userId: command.userId, active: true } })
		if (!avatar) return ErrorEnum.NOT_FOUND
		await this.deleteAvatar(avatar)
		return true
	}

	private async deleteAvatar(avatar: Avatar) {
		return this.prismaClient.$transaction(async (tx) => {
			await tx.avatar.delete({ where: { id: avatar.id } })
			await this.filesFirebaseAdapter.deleteAvatar(avatar.uploadPath)
		})
	}

}