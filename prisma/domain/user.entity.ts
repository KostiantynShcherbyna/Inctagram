import { PrismaClient, User } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { generateHashService } from '../../apps/infrastructure/services/generate-hash.service'
import { EMAIL_CONFIRMATION_CODE_EXP_TIME } from '../../apps/infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../apps/infrastructure/configurations/configuration'
import { TokensService } from '../../apps/infrastructure/services/tokens.service'

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
			'EMAIL_CONFIRMATION_CODE_SECRET',
			{ infer: true }
		)
		const confirmationCode = await tokensService.createToken(
			{ username, email },
			confirmationCodeSecret,
			EMAIL_CONFIRMATION_CODE_EXP_TIME
		)

		return this.prisma.create({
			data: {
				username,
				email,
				passwordHash,
				confirmationCode
			}
		})
	}

	// async updateConfirmationCode(
	// 	id: string,
	// 	confirmationCode: string
	// ): Promise<User> {
	// 	return this.prisma.update({
	// 		where: { id },
	// 		data: { confirmationCode }
	// 	})
	// }
}
