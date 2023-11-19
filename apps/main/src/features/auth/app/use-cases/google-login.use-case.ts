import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { OAuthLoginBodyInputModel } from '../../utils/models/input/oAuth-login.input-model'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { ExpiresTime } from '../../../../infrastructure/utils/constants'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'
import { User } from '@prisma/client'

export class GoogleLoginCommand {
	constructor(public user: Partial<User>) {
	}
}

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginUseCase implements ICommandHandler<GoogleLoginCommand> {
	constructor(
		protected configService: ConfigService,
		protected tokensService: TokensService
	) {
	}

	async execute(command: GoogleLoginCommand) {
		const env = this.configService.get<IEnvConfig>('env')
		console.log('execute')
		const issueAt = new Date(Date.now())

		const tokensPayload = {
			deviceId: randomUUID(),
			//ip: command.deviceIp,
			//title: command.userAgent,
			//userId: user.id,
			email: command.user.email,
			username: command.user.username,
			issueAt: issueAt
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
		const callbackUrl = `${env.OAUTH_REDIRECT_URL}/${command.user.id}`

		return { accessJwt: { accessToken }, refreshToken, callbackUrl }
	}
}
