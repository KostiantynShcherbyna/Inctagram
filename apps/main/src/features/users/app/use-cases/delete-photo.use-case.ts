import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { Secrets } from '../../../../infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'

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
		protected tokensService: TokensService
	) {
	}

	async execute(command: DeletePhotoCommand) {
		const userPhotoSecret = this.configService
			.get(Secrets.USERPHOTO_SECRET, { infer: true })

		const photoDetails = await this.tokensService
			.verifyToken(command.photoToken, userPhotoSecret)
		if (!photoDetails)
			return new ReturnContract(null, ErrorEnum.FORBIDDEN)

		const photo = await this.userPhotosRepository
			.findUserPhotoById(photoDetails.photoId)
		if (!photo)
			return new ReturnContract(null, ErrorEnum.NOT_FOUND)
		if (photo.userId !== command.userId)
			return new ReturnContract(null, ErrorEnum.FORBIDDEN)

		await this.filesFirebaseAdapter.deleteUserPhoto(photo.path)
		await this.userPhotosRepository.deleteUserPhoto(photo.id)
		return new ReturnContract(true, null)
	}

}