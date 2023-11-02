import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { Base64Service } from '../../../../infrastructure/services/base64.service'

export class DeletePhotoCommand {
	constructor(
		public userId: string,
		public photoToken: string
	) {
	}
}


@CommandHandler(DeletePhotoCommand)
export class DeletePhotoUseCase implements ICommandHandler<DeletePhotoCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected userPhotosRepository: UserPhotosRepository,
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: DeletePhotoCommand) {

		const photoDetails = await this.base64Service
			.decodeUserPhotoPath(command.photoToken)
		// Split on two parts userId and photoId
		const photoSplitResult = photoDetails.split(' ')
		// Take on first part is userId
		if (photoSplitResult[0] !== command.userId) return ErrorEnum.FORBIDDEN
		// Take on second part is photoId
		const photo = await this.userPhotosRepository
			.findUserPhotoById(photoSplitResult[1])

		if (!photo) return ErrorEnum.NOT_FOUND
		if (photo.userId !== command.userId) return ErrorEnum.FORBIDDEN

		await this.filesFirebaseAdapter.deleteUserPhoto(photo.uploadPath)
		await this.userPhotosRepository.deleteUserPhoto(photo.id)
		return true
	}


}