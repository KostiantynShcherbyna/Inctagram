import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { Base64Service } from '../../../infrastructure/services/base64.service'
import { FirebaseAdapter } from '../../../infrastructure/adapters/firebase.adapter'
import { ErrorEnum } from '../../../../../main/src/infrastructure/utils/error-enum'
import { ICreateAvatar } from '../../../infrastructure/types/auth.types'

export class UploadAvatarCommand {
	constructor(
		public userId: string,
		public file: Express.Multer.File
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
		if (user === null) return ErrorEnum.NOT_FOUND

		const metadata = await sharp(command.file.buffer).metadata()

		const avatarId = randomUUID()

		const avatarPath = await this.base64Service.encodeAvatarPath({
			userId: command.userId,
			avatarId: avatarId,
			originalname: command.file.originalname
		})

		const uploadUrl = await this.uploadAvatar({
			id: avatarId,
			userId: command.userId,
			uploadPath: avatarPath,
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
			await tx.avatar.create({ data })
			return await this.firebaseAdapter
				.uploadAvatar(data.uploadPath, buffer)
		})
	}


}


// await this.prismaClient.$transaction([
// 	this.prismaClient.media.updateMany({
// 		where: { userId: user.id, isAvatar: true },
// 		data: { isAvatar: false }
// 	}),
// 	this.prismaClient.media.create({
// 		data: {
// 			id: avatarId,
// 			userId: command.userId,
// 			uploadPath: avatarPath,
// 			contentType: command.file.mimetype,
// 			height: metadata.height,
// 			width: metadata.width,
// 			size: command.file.size
// 		}
// 	})
// ])

// const uploadUrl = await this.filesFirebaseAdapter
// 	.uploadAvatar(avatarPath, command.file.buffer)
