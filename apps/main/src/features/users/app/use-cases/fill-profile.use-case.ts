import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient, User } from '@prisma/client'
import { randomUUID } from 'crypto'
import { FilesFirebaseAdapter } from '../../../../infrastructure/adapters/files.firebase.adapter'
import { Base64Service } from '../../../../infrastructure/services/base64.service'
import { UpdateProfileBodyInputModel } from '../../utils/models/input/update-profile.body.input-model'
import sharp from 'sharp'

export class FillProfileCommand {
	constructor(
		public userId: string,
		public profile: UpdateProfileBodyInputModel,
		public file: Express.Multer.File
	) {
	}
}

@CommandHandler(FillProfileCommand)
export class FillProfileUseCase
	implements ICommandHandler<FillProfileCommand> {
	constructor(
		protected filesFirebaseAdapter: FilesFirebaseAdapter,
		protected usersRepository: UsersRepository,
		protected prismaClient: PrismaClient,
		protected base64Service: Base64Service
	) {
	}

	async execute(command: FillProfileCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (!user) return ErrorEnum.NOT_FOUND

		const metadata = await sharp(command.file.buffer).metadata()

		const photoId = randomUUID()

		const photoPath = await this.base64Service.encodeAvatarPath({
			userId: command.userId,
			avatarId: photoId,
			originalname: command.file.originalname
		})

		await this.filesFirebaseAdapter
			.uploadAvatar(photoPath, command.file.buffer)

		// const [userPhoto, updatedUser] = await this.prismaClient.$transaction([
		// 	this.prismaClient.avatar.create({
		// 		data: {
		// 			id: photoId,
		// 			userId: command.userId,
		// 			uploadPath: photoPath,
		// 			contentType: command.file.mimetype,
		// 			size: command.file.size,
		// 			width: metadata.width,
		// 			height: metadata.height
		// 		}
		// 	}),
		// 	this.prismaClient.user.update(
		// 		{ where: { id: user.id }, data: { ...command.profile } })
		// ])
		//
		// return this.mapUpdatedUser(updatedUser)
	}

	private mapUpdatedUser(updatedUser: User) {
		return {
			id: updatedUser.id,
			email: updatedUser.email,
			username: updatedUser.username,
			firstname: updatedUser.firstname,
			lastname: updatedUser.lastname,
			birthDate: updatedUser.birthDate,
			city: updatedUser.city,
			aboutMe: updatedUser.aboutMe,
			createdAt: updatedUser.createdAt,
			isConfirmed: updatedUser.isConfirmed
		}
	}

}