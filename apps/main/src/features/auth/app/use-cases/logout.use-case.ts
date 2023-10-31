import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { UsersRepository } from '../../../users/rep/users.repository'
import { DevicesRepository } from '../../../users/rep/devices.repository'

export class LogoutCommand {
	constructor(
		public deviceId: string,
		public expireAt: Date,
		public ip: string,
		public lastActiveDate: Date,
		public title: string,
		public userId: string
	) {
	}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
	constructor(
		protected devicesRepository: DevicesRepository,
		protected usersRepository: UsersRepository
	) {
	}

	async execute(command: LogoutCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const device = await this.devicesRepository.findDeviceById(command.deviceId)
		if (device === null)
			return new ReturnContract(null, ErrorEnum.DEVICE_NOT_FOUND)
		if (new Date(command.lastActiveDate).toISOString() !== device.lastActiveDate.toISOString())
			return new ReturnContract(null, ErrorEnum.TOKEN_NOT_VERIFY) // TODO Think about

		const deleteResult = await this.devicesRepository
			.deleteDeviceById(command.deviceId)
		if (deleteResult === null)
			return new ReturnContract(null, ErrorEnum.DEVICE_NOT_DELETE)

		return new ReturnContract(true, null)
	}
}
