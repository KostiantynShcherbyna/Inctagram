import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorMessageEnum } from '../../../../infrastructure/utils/error-message-enum'
import { PrismaClient } from '@prisma/client'
import { ResponseContract } from '../../../../infrastructure/utils/response-contract'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/repo/users.repository'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'

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
		protected emailAdapter: EmailAdapter
	) {
	}

	async execute(command: RegistrationCommand) {
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.login,
			command.email
		)
		if (user?.username === command.login)
			return new ResponseContract(null, ErrorMessageEnum.USER_LOGIN_EXIST)
		if (user?.email === command.email)
			return new ResponseContract(null, ErrorMessageEnum.USER_EMAIL_EXIST)

		await this.prisma.$transaction(async () => {
			const user = await this.usersRepository
				.createUser({
					username: command.login,
					email: command.email,
					password: command.password
				})
			const confirmationCode = await this
				.generateConfirmationCode({
					userId: user.id,
					tokensService: this.tokensService,
					configService: this.configService
				})
			console.log('confirmationCode', confirmationCode)
			await this.usersRepository
				.createConfirmationCode(user.id, confirmationCode)

			this.emailAdapter.sendConfirmationCode(user.email, confirmationCode)
		})

		return new ResponseContract(true, null)
	}

	private async generateConfirmationCode({ userId, tokensService, configService })
		: Promise<string> {
		const confirmationCodeSecret = configService.get(
			Secrets.EMAIL_CONFIRMATION_CODE_SECRET,
			{ infer: true })

		return tokensService.createToken(
			{ userId },
			confirmationCodeSecret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME)
	}


}
