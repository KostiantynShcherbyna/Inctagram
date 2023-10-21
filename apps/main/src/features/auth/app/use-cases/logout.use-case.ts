import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorMessageEnum } from '../../../../infrastructure/utils/error-message-enum'
import { ResponseContract } from '../../../../infrastructure/utils/response-contract'
import { UsersRepository } from '../../../users/repo/users.repository'
import { DevicesRepository } from '../../../users/repo/devices.repository'

export class LogoutCommand {
	constructor(
		public deviceId: string,
		public expireAt: Date,
		public ip: string,
		public lastActiveDate: string,
		public title: string,
		public userId: string
	) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
	constructor(
		protected devicesRepository: DevicesRepository,
		protected usersRepository: UsersRepository
	) {}

	async execute(command: LogoutCommand) {
		const user = await this.usersRepository.findUserById(command.userId)
		if (user === null)
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)

		const device = await this.devicesRepository.findDeviceById(command.deviceId)
		if (device === null)
			return new ResponseContract(null, ErrorMessageEnum.DEVICE_NOT_FOUND)
		if (command.lastActiveDate !== device.lastActiveDate)
			return new ResponseContract(null, ErrorMessageEnum.TOKEN_NOT_VERIFY)

		const deleteResult = await this.devicesRepository.deleteDevice(
			command.deviceId
		)
		if (deleteResult === null)
			return new ResponseContract(null, ErrorMessageEnum.DEVICE_NOT_DELETE)

		return new ResponseContract(true, null)
	}
}
