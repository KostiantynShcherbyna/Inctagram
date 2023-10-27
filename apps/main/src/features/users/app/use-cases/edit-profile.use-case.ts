import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../repo/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient, User } from '@prisma/client'

interface IEditProfile {
	userId: string | null,
	username: string | null,
	firstname: string | null,
	lastname: string | null,
	birthDate: Date | null,
	city: string | null,
	aboutMe: string | null,
}

export class EditProfileCommand {
	constructor(
		public details: IEditProfile
	) {
	}
}

@CommandHandler(EditProfileCommand)
export class EditProfileUseCase
	implements ICommandHandler<EditProfileCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected prismaClient: PrismaClient
	) {
	}

	async execute(command: EditProfileCommand) {
		const user = await this.usersRepository.findUserById(command.details.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const updatedUser = await this.prismaClient.$transaction(
			async (): Promise<User> => {
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