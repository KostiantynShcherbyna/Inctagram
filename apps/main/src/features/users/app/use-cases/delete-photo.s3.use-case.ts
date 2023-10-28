import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { FilesS3Adapter } from '../../../../infrastructure/adapters/files-s3.adapter'
import { UserPhotosRepository } from '../../repo/user-photos.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'

export class DeletePhotoS3Command {
	constructor(
		public userId: string,
		public photoId: string
	) {
	}
}


@CommandHandler(DeletePhotoS3Command)
export class DeletePhotoS3UseCase implements ICommandHandler<DeletePhotoS3Command> {
	constructor(
		protected filesS3Adapter: FilesS3Adapter,
		protected userPhotosRepository: UserPhotosRepository
	) {
	}

	async execute(command: DeletePhotoS3Command) {
		const photo = await this.userPhotosRepository.findUserPhoto(command.photoId)
		if (!photo) return new ReturnContract(null, ErrorEnum.NOT_FOUND)
		if (photo.userId !== command.userId)
			return new ReturnContract(null, ErrorEnum.FORBIDDEN)

		await this.filesS3Adapter.deleteUserPhoto(photo.path)
		await this.userPhotosRepository.deleteUserPhoto(photo.id)
		return new ReturnContract(true, null)
	}

}