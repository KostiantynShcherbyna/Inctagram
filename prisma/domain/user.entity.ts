import { PrismaClient, User } from '@prisma/client'
import { generateHashService } from '../../apps/main/src/infrastructure/services/generate-hash.service'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../apps/main/src/infrastructure/settings/custom-settings'
import { TokensService } from '../../apps/main/src/infrastructure/services/tokens.service'
import { ExpiresTime, Secrets } from '../../apps/main/src/infrastructure/utils/constants'

export interface ICreateUser {
	username: string
	email: string
	password: string
	configService: ConfigService<ConfigType, true>
	tokensService: TokensService
}

export class UserEntity {
	constructor(private readonly prisma: PrismaClient['user']) {}

	async createUser({
		username,
		email,
		password,
		configService,
		tokensService
	}: ICreateUser): Promise<User> {
		const passwordHash = await generateHashService(password)

		const confirmationCodeSecret = configService.get(
			Secrets.EMAIL_CONFIRMATION_CODE_SECRET,
			{ infer: true }
		)
		const confirmationCode = await tokensService.createToken(
			{ username, email },
			confirmationCodeSecret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME
		)
		console.log('confirmationCode', confirmationCode)

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
