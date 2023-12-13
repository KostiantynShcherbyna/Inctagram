import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { User } from '@prisma/client'
import { UpdateProfileBodyInputModel } from '../../utils/models/input/update-profile.body.input-model'


export class UpdateProfileCommand {
	constructor(
		public userId: string,
		public data: UpdateProfileBodyInputModel
	) {
	}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
	implements ICommandHandler<UpdateProfileCommand> {
	constructor(protected usersRepository: UsersRepository) {
	}

	async execute(command: UpdateProfileCommand) {

		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null) return ErrorEnum.USER_NOT_FOUND

		const updatedUser = await this.usersRepository
			.updateUserInfo(user.id, { ...command.data })
			if (user === null) return ErrorEnum.USER_NOT_FOUND

		return this.mapUpdatedUser(updatedUser)
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