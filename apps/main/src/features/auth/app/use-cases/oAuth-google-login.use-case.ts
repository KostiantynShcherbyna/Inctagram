import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { ConfigService } from '@nestjs/config'

import { OAuthLoginBodyInputModel } from '../../utils/models/input/oAuth-login.input-model'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { ResponseContract } from '../../../../infrastructure/utils/response-contract'

export class OAuthGoogleLoginCommand {
	constructor(public loginBody: OAuthLoginBodyInputModel) {
	}
}

@CommandHandler(OAuthGoogleLoginCommand)
export class OAuthGoogleUseCase implements ICommandHandler<OAuthGoogleLoginCommand> {
	constructor(
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService
	) {
	}

	async execute(command: OAuthGoogleLoginCommand) {
		const accessJwtSecret = this.configService.get(
			Secrets.ACCESS_JWT_SECRET, { infer: true })

		const refreshJwtSecret = this.configService.get(
			Secrets.REFRESH_JWT_SECRET, { infer: true })

		const issueAt = new Date(Date.now())

		const tokensPayload = {
			deviceId: randomUUID(),
			//ip: command.deviceIp,
			//title: command.userAgent,
			//userId: user.id,
			email: command.loginBody.email,
			username: command.loginBody.username,
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
			{ accessJwt: { accessToken }, refreshToken },
			null
		)
	}
}