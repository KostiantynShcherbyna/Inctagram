import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { FirebaseAdapter } from '../../../infrastructure/adapters/firebase.adapter'
import { Base64Service } from '../../../infrastructure/services/base64.service'
import { ErrorEnum } from '../../../../../main/src/infrastructure/utils/error-enum'

export class UploadPostImageCommand {
	constructor(
		public userId: string,
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
		const user = await this.prismaClient.user
			.findUnique({ where: { id: command.userId } })
		if (user === null) return ErrorEnum.NOT_FOUND

		const metadata = await sharp(command.file.buffer).metadata()

		const imageId = randomUUID()

		const photoPath = await this.base64Service.encodePostImagePath({
			userId: command.userId,
			imageId: imageId,
			postId: imageId,
			originalname: command.file.originalname
		})

		await this.prismaClient.postImage.create({
			data: {
				id: imageId,
				uploadPath: photoPath,
				contentType: command.file.mimetype,
				userId: command.userId,
				width: metadata.width,
				height: metadata.height,
				size: command.file.size,
				postId: null
			}
		})

		const uploadUrl = await this.firebaseAdapter
			.uploadAvatar(photoPath, command.file.buffer)

		return {
			id: imageId,
			url: uploadUrl,
			width: metadata.width,
			height: metadata.height,
			size: command.file.size
		}

	}


}