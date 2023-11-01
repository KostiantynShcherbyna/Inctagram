import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PhotoNormalTypes } from '../../../../infrastructure/utils/constants'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { PrismaClient } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { randomUUID } from 'crypto'
import { Base64Service } from '../../../../infrastructure/services/base64.service'

export class UploadPhotoCommand {
	constructor(
		public userId: string,
		public originalname: string,
		public buffer: Buffer,
		public mimetype: PhotoNormalTypes
	) {
	}
}


interface ICreateUserPhotoPathToken {
	userId: string
	photoId: string
	originalname: string
	tokensService: TokensService
	configService: ConfigService<ConfigType, true>
}


@CommandHandler(UploadPhotoCommand)
export class UploadPhotoUseCase
	implements ICommandHandler<UploadPhotoCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected usersRepository: UsersRepository,
		protected userPhotosRepository: UserPhotosRepository,
		protected prisma: PrismaClient,
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: UploadPhotoCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const photoId = randomUUID()

		const photoPath = await this.base64Service.encodeUserPhoto({
			userId: command.userId,
			photoId: photoId,
			originalname: command.originalname
		})

		await this.userPhotosRepository.uploadUserPhoto({
			id: photoId,
			userId: command.userId,
			path: photoPath,
			contentType: command.mimetype
		})

		const uploadFileUrl = await this.filesFirebaseAdapter
			.uploadUserPhoto(photoPath, command.buffer)

		return new ReturnContract(
			{ url: uploadFileUrl, photoToken: photoPath },
			null
		)
	}


}