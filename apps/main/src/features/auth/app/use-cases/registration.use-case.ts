import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { PrismaClient } from '@prisma/client'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { HashService } from '../../../../infrastructure/services/hash.service'

export class RegistrationCommand {
	constructor(
		public login: string,
		public email: string,
		public password: string
	) {
	}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
	implements ICommandHandler<RegistrationCommand> {
	constructor(
		protected prisma: PrismaClient,
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter,
		protected hashService: HashService
	) {
	}

	async execute(command: RegistrationCommand) {
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.login,
			command.email
		)
		if (user?.username === command.login)
			return new ReturnContract(null, ErrorEnum.USER_LOGIN_EXIST)
		if (user?.email === command.email)
			return new ReturnContract(null, ErrorEnum.USER_EMAIL_EXIST)

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
					configService: this.configService
				})
				const newConfirmationCode = await this.usersRepository
					.createConfirmationCode(user.id, confirmationCode)

				return { user, newConfirmationCode }
			})

		if (!registrationResult)
			return new ReturnContract(false, ErrorEnum.EXCEPTION)

		await this.emailAdapter.sendConfirmationCode(
			registrationResult.user.email,
			registrationResult.newConfirmationCode.confirmationCode)
		return new ReturnContract(true, null)
	}


	private async generateConfirmationCode(
		{ userId, tokensService, configService }): Promise<string> {
		const confirmationCodeSecret = configService.get(
			Secrets.EMAIL_CONFIRMATION_CODE_SECRET,
			{ infer: true })

		return tokensService.createToken(
			{ userId },
			confirmationCodeSecret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME)
	}


}
