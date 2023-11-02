import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../rep/users.repository'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { User } from '@prisma/client'
import { EditProfileBodyInputModel } from '../../utils/models/input/edit-profile.body.input-model'


export class EditProfileCommand {
	constructor(
		public userId: string,
		public data: EditProfileBodyInputModel
	) {
	}
}

@CommandHandler(EditProfileCommand)
export class EditProfileUseCase
	implements ICommandHandler<EditProfileCommand> {
	constructor(protected usersRepository: UsersRepository) {
	}

	async execute(command: EditProfileCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null) return ErrorEnum.NOT_FOUND

		const updatedUser = await this.usersRepository
			.editUserInfo(user.id, { ...command.data })

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