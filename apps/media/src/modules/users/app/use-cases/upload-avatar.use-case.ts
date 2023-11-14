import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { FirebaseAdapter } from '../../../../infrastructure/adapters/firebase.adapter'
import { ICreateAvatar } from '../../../../infrastructure/types/users.types'
import sharp from 'sharp'
import { RpcException } from '@nestjs/microservices'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'

export class UploadAvatarCommand {
	constructor(
		public userId: string,
		public file: any
	) {
	}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase
	implements ICommandHandler<UploadAvatarCommand> {
	constructor(

		protected firebaseAdapter: FirebaseAdapter,
		protected prismaClient: PrismaClient,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: UploadAvatarCommand) {

		const user = await this.prismaClient.user
			.findUnique({ where: { id: command.userId } })
		if (user === null) throw new RpcException(ErrorEnum.USER_NOT_FOUND)

		const imgBuffer = Buffer.from(command.file.buffer.data)
		const metadata = await sharp(imgBuffer).metadata()

		const avatarId = randomUUID()
		const avatarPath = await this.base64Service.encodeAvatarPath({
			userId: command.userId,
			avatarId: avatarId,
			originalname: command.file.originalname
		})

		const uploadUrl = await this.uploadAvatar({
			id: avatarId,
			userId: command.userId,
			path: avatarPath,
			contentType: command.file.mimetype,
			height: metadata.height,
			width: metadata.width,
			size: command.file.size
		}, command.file.buffer)

		return {
			url: uploadUrl,
			width: metadata.width,
			height: metadata.height,
			size: command.file.size
		}

	}

	private async uploadAvatar(data: ICreateAvatar, buffer: Buffer)
		: Promise<string> {
		return this.prismaClient.$transaction(async (tx): Promise<string> => {
			await tx.avatar.updateMany({
				where: { userId: data.userId, active: true },
				data: { active: false }
			})
			const uploadUrl = await this.firebaseAdapter
				.upload(`avatars/${data.path}`, buffer)
			await tx.avatar.create({ data: { ...data, url: uploadUrl } })
			return uploadUrl
		})
	}


}
