import { PrismaClient, User } from '@prisma/client'
import { generateHashService } from '../../apps/infrastructure/services/generate-hash.service'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../apps/infrastructure/configurations/configuration'
import { TokensService } from '../../apps/infrastructure/services/tokens.service'
import { ExpiresTime } from '../../apps/infrastructure/utils/constants'

export interface ICreateUser {
	username: string
	email: string
	password: string
	configService: ConfigService<ConfigType, true>
	tokensService: TokensService
}

export class UserEntity {
	constructor(private readonly prisma: PrismaClient['user']) {
	}

	async createUser({ username, email, password, configService, tokensService }: ICreateUser)
		: Promise<User> {
		const passwordHash = await generateHashService(password)

		const confirmationCodeSecret = configService.get(
			'EMAIL_CONFIRMATION_CODE_SECRET',
			{ infer: true }
		)
		const confirmationCode = await tokensService.createToken(
			{ username, email },
			confirmationCodeSecret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME
		)

		return this.prisma.create({
			data: {
				username,
				email,
				passwordHash,
				confirmationCodes: [confirmationCode]
			}
		})
	}
}
