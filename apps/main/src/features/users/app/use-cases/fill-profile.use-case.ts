import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { FilesS3Adapter, ISavePhoto } from '../../../../infrastructure/adapters/files-s3.adapter'
import { UsersRepository } from '../../rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient, User } from '@prisma/client'
import { UserPhotosRepository } from '../../rep/user-photos.repository'
import { join } from 'node:path'
import { randomUUID } from 'crypto'

interface IFillProfile {
	userId: string,
	username: string,
	firstname: string,
	lastname: string,
	birthDate: string,
	city: string,
	aboutMe: string,
	file: ISavePhoto
}

export class FillProfileCommand {
	constructor(public details: IFillProfile) {
	}
}

@CommandHandler(FillProfileCommand)
export class FillProfileUseCase
	implements ICommandHandler<FillProfileCommand> {
	constructor(
		protected filesS3Adapter: FilesS3Adapter,
		protected usersRepository: UsersRepository,
		protected prisma: PrismaClient
	) {
	}

	async execute(command: FillProfileCommand) {
		const user = await this.usersRepository.findUserById(command.details.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const photoId = randomUUID()

		const folderPath = join(
			'users', command.details.userId,
			'photos', photoId, command.details.file.originalname)

		await this.filesS3Adapter.uploadUserPhoto(folderPath, {
			originalname: command.details.file.originalname,
			buffer: command.details.file.buffer,
			mimetype: command.details.file.mimetype
		})

		const [userPhoto, updatedUser] = await this.prisma.$transaction([
			this.prisma.userPhoto.create({
				data: {
					id: photoId,
					userId: command.details.userId,
					path: folderPath,
					contentType: command.details.file.mimetype
				}
			}),
			this.prisma.user.update({
				where: { id: user.id },
				data: {
					firstname: command.details.firstname,
					lastname: command.details.lastname,
					birthDate: command.details.birthDate,
					aboutMe: command.details.aboutMe,
					city: command.details.city
				}
			})
		])

		return new ReturnContract(this.mapUpdatedUser(updatedUser), null)
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