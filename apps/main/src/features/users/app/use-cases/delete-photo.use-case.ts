import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
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
			.decodeUserPhoto(command.photoToken)
		// Split on two parts userId and photoId
		const photoTo = photoDetails.split(' ')
		// Take on first part is userId
		if (photoTo[0] !== command.userId)
			return new ReturnContract(null, ErrorEnum.FORBIDDEN)
		// Take on second part is photoId
		const photo = await this.userPhotosRepository
			.findUserPhotoById(photoTo[1])

		if (!photo) return new ReturnContract(null, ErrorEnum.NOT_FOUND)
		if (photo.userId !== command.userId)
			return new ReturnContract(null, ErrorEnum.FORBIDDEN)

		await this.filesFirebaseAdapter.deleteUserPhoto(photo.path)
		await this.userPhotosRepository.deleteUserPhoto(photo.id)
		return new ReturnContract(true, null)
	}


}