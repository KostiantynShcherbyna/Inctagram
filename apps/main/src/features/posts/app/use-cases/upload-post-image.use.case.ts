import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import sharp from 'sharp'

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
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected usersRepository: UsersRepository,
		protected prismaClient: PrismaClient,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: UploadPostImageCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

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

		const uploadUrl = await this.filesFirebaseAdapter
			.uploadAvatar(photoPath, command.file.buffer)

		return new ReturnContract({
				id: imageId,
				url: uploadUrl,
				width: metadata.width,
				height: metadata.height,
				size: command.file.size
			}, null
		)
	}


}