import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { FilesS3Adapter, ISavePhoto } from '../../../../infrastructure/adapters/files-s3.adapter'
import { UsersRepository } from '../../repo/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient, User } from '@prisma/client'
import { UserPhotosRepository } from '../../repo/user-photos.repository'

interface IFillProfile {
	userId: string,
	username: string,
	firstname: string,
	lastname: string,
	birthDate: Date,
	city: string,
	aboutMe: string,
	file: ISavePhoto
}

export class FillProfileCommand {
	constructor(
		public details: IFillProfile
	) {
	}
}

@CommandHandler(FillProfileCommand)
export class FillProfileUseCase
	implements ICommandHandler<FillProfileCommand> {
	constructor(
		protected filesS3Adapter: FilesS3Adapter,
		protected usersRepository: UsersRepository,
		protected userPhotosRepository: UserPhotosRepository,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: FillProfileCommand) {
		const user = await this.usersRepository.findUserById(command.details.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const relativeFolderPath = await this.filesS3Adapter.uploadUserPhoto(
			user.id,
			{
				originalname: command.details.file.originalname,
				buffer: command.details.file.buffer,
				mimetype: command.details.file.mimetype
			})

		if (!relativeFolderPath)
			return new ReturnContract(null, ErrorEnum.EXCEPTION)

		const updatedUser = await this.prismaClient.$transaction(
			async (): Promise<User> => {
				await this.userPhotosRepository.uploadUserPhoto({
					userId: command.details.userId,
					path: relativeFolderPath,
					contentType: command.details.file.mimetype
				})
				return await this.usersRepository.updateUserInfo(user.id, {
					firstname: command.details.firstname,
					lastname: command.details.lastname,
					birthDate: command.details.birthDate,
					aboutMe: command.details.aboutMe,
					city: command.details.city
				})
			})

		return new ReturnContract(updatedUser, null)
	}

}