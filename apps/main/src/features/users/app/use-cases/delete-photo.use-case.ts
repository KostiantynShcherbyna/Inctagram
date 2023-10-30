import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'

export class DeletePhotoCommand {
	constructor(
		public userId: string,
		public photoId: string
	) {
	}
}


@CommandHandler(DeletePhotoCommand)
export class DeletePhotoUseCase implements ICommandHandler<DeletePhotoCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected userPhotosRepository: UserPhotosRepository
	) {
	}

	async execute(command: DeletePhotoCommand) {
		const photo = await this.userPhotosRepository.findUserPhotoById(command.photoId)
		if (!photo) return new ReturnContract(null, ErrorEnum.NOT_FOUND)
		if (photo.userId !== command.userId)
			return new ReturnContract(null, ErrorEnum.FORBIDDEN)

		await this.filesFirebaseAdapter.deleteUserPhoto(photo.path)
		await this.userPhotosRepository.deleteUserPhoto(photo.id)
		return new ReturnContract(true, null)
	}

}