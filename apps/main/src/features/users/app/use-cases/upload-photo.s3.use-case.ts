import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { FilesS3Adapter } from '../../../../infrastructure/adapters/files-s3.adapter'
import { UsersRepository } from '../../repo/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PhotoNormalTypes } from '../../../../infrastructure/utils/constants'
import { UserPhotosRepository } from '../../repo/user-photos.repository'

export class UploadPhotoS3Command {
	constructor(
		public userId: string,
		public originalName: string,
		public wallpaperBuffer: Buffer,
		public contentType: PhotoNormalTypes
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

		const relativeFolderPath = await this.filesS3Adapter.uploadUserPhoto(
			command.userId,
			{
				originalname: command.originalName,
				buffer: command.wallpaperBuffer,
				mimetype: command.contentType
			})

		await this.userPhotosRepository.uploadUserPhoto({
			userId: command.userId,
			path: relativeFolderPath,
			contentType: command.contentType
		})

		return new ReturnContract(true, null)
	}

}