import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { FilesS3Adapter } from '../../../../infrastructure/adapters/files-s3.adapter'
import { UsersRepository } from '../../rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PhotoNormalTypes } from '../../../../infrastructure/utils/constants'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { randomUUID } from 'crypto'
import { join } from 'node:path'

export class UploadPhotoS3Command {
	constructor(
		public userId: string,
		public originalname: string,
		public buffer: Buffer,
		public mimetype: PhotoNormalTypes
	) {
	}
}


@CommandHandler(UploadPhotoS3Command)
export class UploadPhotoS3UseCase
	implements ICommandHandler<UploadPhotoS3Command> {
	constructor(
		protected filesS3Adapter: FilesS3Adapter,
		protected usersRepository: UsersRepository,
		protected userPhotosRepository: UserPhotosRepository
	) {
	}

	async execute(command: UploadPhotoS3Command) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const photoId = randomUUID()

		const folderPath = join(
			'users', command.userId,
			'photos', photoId, command.originalname)

		await this.filesS3Adapter.uploadUserPhoto(folderPath, {
			originalname: command.originalname,
			buffer: command.buffer,
			mimetype: command.mimetype
		})

		await this.userPhotosRepository.uploadUserPhoto({
			userId: command.userId,
			path: folderPath,
			contentType: command.mimetype
		})

		return new ReturnContract(true, null)
	}

}