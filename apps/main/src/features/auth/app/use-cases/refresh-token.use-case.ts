import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { DeviceSessionHeaderInputModel } from '../../utils/models/input/device-session.header.input-model'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ExpiresTime } from '../../../../infrastructure/utils/constants'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'
import { randomUUID } from 'crypto'
import { DevicesRepository } from '../../../users/rep/devices.repository'

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
		protected usersRepository: UsersRepository,
		protected deviceRepository: DevicesRepository,
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
		// if (command.deviceSession.iat !== device.lastActiveDate)
		// 	return ErrorEnum.INVALID_TOKEN

		const tokenPayload = {
			userId: user.id,
			id: randomUUID(),
			ip: command.deviceIp,
			title: command.userAgent
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

		const refreshTokenVerify = await this.tokensService
			.verifyToken(refreshToken, env.REFRESH_JWT_SECRET)

		await this.usersRepository.createDevice({
			...tokenPayload,
			lastActiveDate: new Date(refreshTokenVerify.iat),
			expireAt: new Date(refreshTokenVerify.exp)
		})

		await this.deviceRepository.deleteDeviceById(command.deviceSession.id)
		// await this.usersRepository.updateActiveDate(
		// 	tokenPayload.deviceId,
		// 	{
		// 		ip: tokenPayload.deviceIp,
		// 		title: tokenPayload.userAgent,
		// 		lastActiveDate: new Date(refreshTokenVerify.iat),
		// 		expireAt: new Date(refreshTokenVerify.exp)
		// 	})

		return { accessJwt: { accessToken }, refreshToken }
	}
}
