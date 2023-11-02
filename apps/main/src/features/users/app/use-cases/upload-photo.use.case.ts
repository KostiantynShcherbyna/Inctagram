import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { PrismaClient } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { randomUUID } from 'crypto'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { PhotoNormalTypes } from '../../../../infrastructure/utils/constants'
import sharp from 'sharp'

export class UploadPhotoCommand {
	constructor(
		public userId: string,
		public file: Express.Multer.File
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
		protected prisma: PrismaClient,
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: UploadPhotoCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null) return ErrorEnum.NOT_FOUND

		const metadata = await sharp(command.file.buffer).metadata()

		const photoId = randomUUID()

		const photoPath = await this.base64Service.encodeUserPhotoPath({
			userId: command.userId,
			photoId: photoId,
			originalname: command.file.originalname
		})

		await this.userPhotosRepository.uploadUserPhoto({
			id: photoId,
			userId: command.userId,
			path: photoPath,
			contentType: command.file.mimetype as PhotoNormalTypes
		})

		const uploadUrl = await this.filesFirebaseAdapter
			.uploadUserPhoto(photoPath, command.file.buffer)

		return {
			id: photoId,
			url: uploadUrl,
			width: metadata.width,
			height: metadata.height,
			size: command.file.size
		}

	}


}