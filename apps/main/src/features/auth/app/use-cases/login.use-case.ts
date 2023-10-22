import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginBodyInputModel } from '../../utils/models/input/login.body.input-model'
import { randomUUID } from 'crypto'
import { ResponseContract } from '../../../../infrastructure/utils/response-contract'
import { ErrorMessageEnum } from '../../../../infrastructure/utils/error-message-enum'
import { ConfigType } from '../../../../infrastructure/configurations/configuration'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/repo/users.repository'
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
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)

		if (user.isConfirmed === false)
			return new ResponseContract(
				null,
				ErrorMessageEnum.USER_EMAIL_NOT_CONFIRMED
			)

		if (
			(await compareHashService(
				user.passwordHash,
				command.loginBody.password
			)) === false
		)
			return new ResponseContract(null, ErrorMessageEnum.PASSWORD_NOT_COMPARED)
		// ↑↑↑

		const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, {
			infer: true
		})
		const refreshJwtSecret = this.configService.get(
			Secrets.REFRESH_JWT_SECRET,
			{ infer: true }
		)

		const issueAt = new Date(Date.now())

		const tokensPayload = {
			deviceId: randomUUID(),
			ip: command.deviceIp,
			title: command.userAgent,
			userId: user.id,
			issueAt: issueAt
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

		return new ResponseContract(
			{ accessJwt: { accessToken }, refreshToken }, null)
	}
}
