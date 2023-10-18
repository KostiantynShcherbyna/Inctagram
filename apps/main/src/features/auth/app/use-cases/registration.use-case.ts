import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/repo/users.repository'
import { ErrorMessageEnums } from '../../../../../../infrastructure/utils/error-message-enums'
import { PrismaClient } from '@prisma/client'
import { ResponseContract } from '../../../../../../infrastructure/utils/response-contract'
import { generateHashService } from '../../../../../../infrastructure/services/generate-hash.service'
import { EmailAdapter } from '../../../../../../infrastructure/adapters/email.adapter'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../../../infrastructure/configurations/configuration'
import { TokensService } from '../../../../../../infrastructure/services/tokens.service'
import { EMAIL_CONFIRMATION_CODE_EXP_TIME } from '../../../../../../infrastructure/utils/constants'

export class RegistrationCommand {
	constructor(
		public login: string,
		public email: string,
		public password: string
	) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
	implements ICommandHandler<RegistrationCommand>
{
	constructor(
		protected prisma: PrismaClient,
		protected configService: ConfigService<ConfigType, true>,
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter,
		protected tokensService: TokensService
	) {}

	async execute(command: RegistrationCommand) {
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.login,
			command.email
		)
		if (user?.username === command.login)
			return new ResponseContract(null, ErrorMessageEnums.USER_LOGIN_EXIST)
		if (user?.email === command.email)
			return new ResponseContract(null, ErrorMessageEnums.USER_EMAIL_EXIST)

		const passwordHash = await generateHashService(command.password)
		const confirmationCodeSecret = this.configService.get(
			'EMAIL_CONFIRMATION_CODE_SECRET',
			{ infer: true }
		)
		const confirmationCode = await this.tokensService.createToken(
			{ login: command.login, email: command.email },
			confirmationCodeSecret,
			EMAIL_CONFIRMATION_CODE_EXP_TIME
		)

		const newUser = await this.usersRepository.createUser({
			username: command.login,
			email: command.email,
			passwordHash: passwordHash,
			confirmationCode: confirmationCode
		})

		await this.emailAdapter.sendConfirmationCode(newUser)

		return new ResponseContract(true, null)
	}
}
