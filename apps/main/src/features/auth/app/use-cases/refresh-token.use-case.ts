import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { DeviceSessionHeaderInputModel } from '../../utils/models/input/device-session.header.input-model'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'

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
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository
	) {
	}

	async execute(command: RefreshTokenCommand) {
		const user = await this.usersRepository
			.findUserById(command.deviceSession.userId)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const device = await this.usersRepository
			.findDeviceById(command.deviceSession.id)
		if (device === null)
			return new ReturnContract(null, ErrorEnum.DEVICE_NOT_FOUND)
		if (command.deviceSession.iat !== device.lastActiveDate)
			return new ReturnContract(null, ErrorEnum.TOKEN_NOT_VERIFY)

		const accessJwtSecret = this.configService
			.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
		const refreshJwtSecret = this.configService
			.get(Secrets.REFRESH_JWT_SECRET, { infer: true })

		const tokenPayload = {
			deviceId: device.id,
			userId: device.userId,
			deviceIp: command.deviceIp,
			userAgent: command.userAgent
		}
		const accessToken = await this.tokensService
			.createToken(
				tokenPayload, accessJwtSecret, ExpiresTime.ACCESS_EXPIRES_TIME)

		const refreshToken = await this.tokensService
			.createToken(
				tokenPayload, refreshJwtSecret, ExpiresTime.REFRESH_EXPIRES_TIME)

		const timeStamp = new Date(Date.now())
		await this.usersRepository
			.updateActiveDate(tokenPayload.deviceId, timeStamp)

		return new ReturnContract(
			{ accessJwt: { accessToken }, refreshToken }, null)
	}
}
