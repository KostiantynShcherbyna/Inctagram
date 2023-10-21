import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/repo/users.repository'
import { EmailAdapter } from '../../../../../../infrastructure/adapters/email.adapter'
import { ResponseContract } from '../../../../../../infrastructure/utils/response-contract'
import { ErrorMessageEnum } from '../../../../../../infrastructure/utils/error-message-enum'
import { ExpiresTime, Secrets } from '../../../../../../infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../../../infrastructure/configurations/configuration'
import { TokensService } from '../../../../../../infrastructure/services/tokens.service'

export class EmailConfirmationResendCommand {
	constructor(public email: string) {
	}
}

@CommandHandler(EmailConfirmationResendCommand)
export class EmailConfirmationResendUseCase
	implements ICommandHandler<EmailConfirmationResendCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter,
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService
	) {
	}

	async execute(command: EmailConfirmationResendCommand) {
		const user = await this.usersRepository.findUserByEmail(command.email)
		if (user === null)
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)
		if (user.isConfirmed === true)
			return new ResponseContract(null, ErrorMessageEnum.USER_EMAIL_CONFIRMED)

		const newConfirmationCode = await this.createNewConfirmationCode(
			user.username,
			user.email)

		await this.usersRepository.addConfirmationCode(user.id, newConfirmationCode)

		this.emailAdapter.sendConfirmationCode(user)

		return new ResponseContract(true, null)
	}

	private async createNewConfirmationCode(username: string, email: string) {
		const confirmationCodeSecret = this.configService.get(
			Secrets.EMAIL_CONFIRMATION_CODE_SECRET, { infer: true })
		return await this.tokensService.createToken(
			{ username, email }, confirmationCodeSecret, ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME)
	}
}
