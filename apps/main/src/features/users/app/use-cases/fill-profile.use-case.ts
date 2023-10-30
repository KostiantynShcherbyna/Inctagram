import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IFile } from '../../../../infrastructure/adapters/files.s3.adapter'
import { UsersRepository } from '../../rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient, User } from '@prisma/client'
import { join } from 'node:path'
import { randomUUID } from 'crypto'
import { FilesAzureAdapter } from '../../../../infrastructure/adapters/files.azure.adapter'

interface IProfile {
	username: string
	firstname: string
	lastname: string
	birthDate?: string
	city?: string
	aboutMe?: string
}

export class FillProfileCommand {
	constructor(
		public userId: string,
		public profile: IProfile,
		public file: IFile
	) {
	}
}

@CommandHandler(FillProfileCommand)
export class FillProfileUseCase
	implements ICommandHandler<FillProfileCommand> {
	constructor(
		protected filesAzureAdapter: FilesAzureAdapter,
		protected usersRepository: UsersRepository,
		protected prisma: PrismaClient
	) {
	}

	async execute(command: FillProfileCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const photoId = randomUUID()

		const folderPath = join(
			'users', command.userId,
			'photos', photoId, command.file.originalname)

		await this.filesAzureAdapter.uploadUserPhoto(folderPath, {
			originalname: command.file.originalname,
			buffer: command.file.buffer,
			mimetype: command.file.mimetype
		})

		const [userPhoto, updatedUser] = await this.prisma.$transaction([
			this.prisma.userPhoto.create({
				data: {
					id: photoId,
					userId: command.userId,
					path: folderPath,
					contentType: command.file.mimetype
				}
			}),
			this.prisma.user.update({
				where: { id: user.id },
				data: { ...command.profile }
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