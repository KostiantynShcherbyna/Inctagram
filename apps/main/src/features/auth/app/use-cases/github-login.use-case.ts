import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { OAuthLoginBodyInputModel } from '../../utils/models/input/oAuth-login.input-model'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { ExpiresTime } from '../../../../infrastructure/utils/constants'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'
import { User } from '@prisma/client'

export class GitHubLoginCommand {
	constructor(public user: Partial<User>) {
	}
}

@CommandHandler(GitHubLoginCommand)
export class GitHubLoginUseCase implements ICommandHandler<GitHubLoginCommand> {
	constructor(
		protected configService: ConfigService,
		protected tokensService: TokensService
	) {
	}

	async execute(command: GitHubLoginCommand) {
		const env = this.configService.get<IEnvConfig>('env')

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
		const callbackUrl = `${env.GOOGLE_OAUTH_CALLBACK_URL}/${command.user.id}`

		return { accessJwt: { accessToken }, refreshToken, callbackUrl }
	}
}
