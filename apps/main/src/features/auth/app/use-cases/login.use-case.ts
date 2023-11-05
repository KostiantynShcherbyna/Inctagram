import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginBodyInputModel } from '../../utils/models/input/login.body.input-model'
import { randomUUID } from 'crypto'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { HashService } from '../../../../infrastructure/services/hash.service'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

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
		protected configService: ConfigService,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected hashService: HashService
	) {
	}

	async execute(command: LoginCommand) {
		const env = this.configService.get<IEnvConfig>('env')

		// ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.loginBody.loginOrEmail,
			command.loginBody.loginOrEmail
		)
		if (user === null) return ErrorEnum.USER_NOT_FOUND

		if (user.isConfirmed === false) return ErrorEnum.EMAIL_NOT_CONFIRMED

		if ((await this.hashService.comparison(
			user.passwordHash, command.loginBody.password)) === false)
			return ErrorEnum.INVALID_PASSWORD
		// ↑↑↑

		const tokensPayload = {
			userId: user.id,
			id: randomUUID(),
			ip: command.deviceIp,
			title: command.userAgent
		}
		const accessToken = await this.tokensService.createToken(
			tokensPayload,
			env.ACCESS_JWT_SECRET,
			ExpiresTime.ACCESS_EXPIRES_TIME
		)
		const refreshToken = await this.tokensService.createToken(
			tokensPayload,
			env.REFRESH_JWT_SECRET,
			ExpiresTime.REFRESH_EXPIRES_TIME
		)

		const refreshTokenVerify = await this.tokensService
			.verifyToken(refreshToken, env.REFRESH_JWT_SECRET)

		await this.usersRepository.createDevice({
			...tokensPayload,
			lastActiveDate: new Date(refreshTokenVerify.iat),
			expireAt: new Date(refreshTokenVerify.exp)
		})
		return { accessJwt: { accessToken }, refreshToken }
	}
}
