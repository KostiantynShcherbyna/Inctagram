import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient } from '@prisma/client'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { ExpiresTime } from '../../../../infrastructure/utils/constants'
import { HashService } from '../../../../infrastructure/services/hash.service'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

export class RegistrationCommand {
	constructor(
		public login: string,
		public email: string,
		public password: string,
		public domain: string,
	) {
	}
}

interface IGenerateConfirmationCode {
	userId: string
	tokensService: TokensService
	secret: string
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
	implements ICommandHandler<RegistrationCommand> {
	constructor(
		protected prisma: PrismaClient,
		protected configService: ConfigService,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter,
		protected hashService: HashService
	) {
	}

	async execute(command: RegistrationCommand) {
		const env = this.configService.get<IEnvConfig>('env')
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.login,
			command.email
		)
		if (user?.username === command.login) return ErrorEnum.LOGIN_EXIST
		if (user?.email === command.email) return ErrorEnum.EMAIL_EXIST

		const passwordHash = await this.hashService.encryption(command.password)
		const registrationResult = await this.prisma.$transaction(
			async () => {
				const user = await this.usersRepository.createUser({
					username: command.login,
					email: command.email,
					passwordHash: passwordHash
				})
				const confirmationCode = await this.generateConfirmationCode({
					userId: user.id,
					tokensService: this.tokensService,
					secret: env.EMAIL_CONFIRMATION_CODE_SECRET
				})
				const newConfirmationCode = await this.usersRepository
					.createConfirmationCode(user.id, confirmationCode)

				return { user, newConfirmationCode }
			})

		await this.emailAdapter.sendConfirmationCode(
			registrationResult.user.email,
			registrationResult.newConfirmationCode.confirmationCode,
			command.domain
		)
		return
	}


	private async generateConfirmationCode(
		{ userId, tokensService, secret }: IGenerateConfirmationCode)
		: Promise<string> {
		return tokensService.createToken(
			{ userId },
			secret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME
		)
	}


}
