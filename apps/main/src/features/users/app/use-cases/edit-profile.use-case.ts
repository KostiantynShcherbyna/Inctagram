import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient, User } from '@prisma/client'
import { IEditProfile } from '../../../../infrastructure/types/edit-profile.interface'



export class EditProfileCommand {
	constructor(
		public userId: string,
		public data: IEditProfile
	) {
	}
}

@CommandHandler(EditProfileCommand)
export class EditProfileUseCase
	implements ICommandHandler<EditProfileCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected prisma: PrismaClient
	) {
	}

	async execute(command: EditProfileCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const updatedUser = await this.usersRepository
			.editUserInfo(user.id, { ...command.data })

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