import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../repo/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient } from '@prisma/client'

interface IEditProfile {
	userId?: string,
	username?: string,
	firstname?: string,
	lastname?: string,
	birthDate?: Date,
	city?: string,
	aboutMe?: string,
}

export class EditProfileCommand {
	constructor(public details: IEditProfile) {
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

		const updatedUser = await this.usersRepository
			.editUserInfo(user.id, { ...command.details })

		return new ReturnContract(updatedUser, null)
	}

}