import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginBodyInputModel } from '../../utils/models/input/login.body.input-model'
import { randomUUID } from 'crypto'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { compareHashService } from '../../../../infrastructure/services/compare-hash.service'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'

export class LoginCommand {
	constructor(
		public loginBody: LoginBodyInputModel,
		public deviceIp: string,
		public userAgent: string
	) {
	}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
	constructor(
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository
	) {
	}

	async execute(command: LoginCommand) {
		// ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.loginBody.loginOrEmail,
			command.loginBody.loginOrEmail
		)
		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		if (user.isConfirmed === false)
			return new ReturnContract(
				null, ErrorEnum.USER_EMAIL_NOT_CONFIRMED)

		if ((await compareHashService(
			user.passwordHash, command.loginBody.password)) === false)
			return new ReturnContract(
				null, ErrorEnum.PASSWORD_NOT_COMPARED)
		// ↑↑↑

		const accessJwtSecret = this.configService
			.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
		const refreshJwtSecret = this.configService
			.get(Secrets.REFRESH_JWT_SECRET, { infer: true })


		const tokensPayload = {
			userId: user.id,
			id: randomUUID(),
			ip: command.deviceIp,
			title: command.userAgent
		}
		const accessToken = await this.tokensService.createToken(
			tokensPayload,
			accessJwtSecret,
			ExpiresTime.ACCESS_EXPIRES_TIME
		)
		const refreshToken = await this.tokensService.createToken(
			tokensPayload,
			refreshJwtSecret,
			ExpiresTime.REFRESH_EXPIRES_TIME
		)

		const refreshTokenVerify = await this.tokensService
			.verifyToken(refreshToken, refreshJwtSecret)

		await this.usersRepository.createDevice({
			...tokensPayload,
			lastActiveDate: new Date(refreshTokenVerify.iat),
			expireAt: new Date(refreshTokenVerify.exp)
		})
		return new ReturnContract(
			{ accessJwt: { accessToken }, refreshToken }, null)
	}
}
