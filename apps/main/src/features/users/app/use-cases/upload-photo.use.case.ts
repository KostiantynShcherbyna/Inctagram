import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PhotoNormalTypes } from '../../../../infrastructure/utils/constants'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { randomUUID } from 'crypto'
import { join } from 'node:path'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { PrismaClient } from '@prisma/client'

export class UploadPhotoCommand {
	constructor(
		public userId: string,
		public originalname: string,
		public buffer: Buffer,
		public mimetype: PhotoNormalTypes
	) {
	}
}


@CommandHandler(UploadPhotoCommand)
export class UploadPhotoUseCase
	implements ICommandHandler<UploadPhotoCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected usersRepository: UsersRepository,
		protected userPhotosRepository: UserPhotosRepository,
		protected prisma: PrismaClient
	) {
	}

	async execute(command: UploadPhotoCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const photoId = randomUUID()

		const folderPath = join(
			'users', command.userId,
			'photos', photoId, command.originalname)

		const uploadFileUrl = await this.prisma.$transaction(async () => {
			await this.userPhotosRepository.uploadUserPhoto({
				userId: command.userId,
				path: folderPath,
				contentType: command.mimetype
			})
			return await this.filesFirebaseAdapter.uploadUserPhoto(folderPath, {
				originalname: command.originalname,
				buffer: command.buffer,
				mimetype: command.mimetype
			})
		})

		return new ReturnContract({ url: uploadFileUrl }, null)
	}

}