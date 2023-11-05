import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { DeviceSessionHeaderInputModel } from '../../utils/models/input/device-session.header.input-model'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ExpiresTime } from '../../../../infrastructure/utils/constants'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

export class RefreshTokenCommand {
	constructor(
		public deviceSession: DeviceSessionHeaderInputModel,
		public deviceIp: string,
		public userAgent: string
	) {
	}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
	implements ICommandHandler<RefreshTokenCommand> {
	constructor(
		protected configService: ConfigService,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository
	) {
	}

	async execute(command: RefreshTokenCommand) {
		const env = this.configService.get<IEnvConfig>('env')

		const user = await this.usersRepository
			.findUserById(command.deviceSession.userId)
		if (user === null) return ErrorEnum.USER_NOT_FOUND

		const device = await this.usersRepository
			.findDeviceById(command.deviceSession.id)
		if (device === null) return ErrorEnum.DEVICE_NOT_FOUND
		if (command.deviceSession.iat !== device.lastActiveDate)
			return ErrorEnum.INVALID_TOKEN

		const tokenPayload = {
			deviceId: device.id,
			userId: device.userId,
			deviceIp: command.deviceIp,
			userAgent: command.userAgent
		}
		const accessToken = await this.tokensService.createToken(
			tokenPayload,
			env.ACCESS_JWT_SECRET,
			ExpiresTime.ACCESS_EXPIRES_TIME
		)

		const refreshToken = await this.tokensService.createToken(
			tokenPayload, env.REFRESH_JWT_SECRET,
			ExpiresTime.REFRESH_EXPIRES_TIME
		)

		const timeStamp = new Date(Date.now())
		await this.usersRepository
			.updateActiveDate(tokenPayload.deviceId, timeStamp)

		return { accessJwt: { accessToken }, refreshToken }
	}
}
