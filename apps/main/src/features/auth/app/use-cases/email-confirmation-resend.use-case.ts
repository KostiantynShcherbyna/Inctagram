import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/repo/users.repository'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'

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
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)
		if (user.isConfirmed === true)
			return new ReturnContract(null, ErrorEnum.USER_EMAIL_CONFIRMED)

		const newConfirmationCode = await this
			.createNewConfirmationCode(user.username, user.email)
		console.log('newConfirmationCode', newConfirmationCode)

		const confirmationCode = await this.usersRepository
			.createConfirmationCode(user.id, newConfirmationCode)

		this.emailAdapter
			.sendConfirmationCode(user.email, confirmationCode.confirmationCode)

		return new ReturnContract(true, null)
	}

	private async createNewConfirmationCode(username: string, email: string) {
		const confirmationCodeSecret = this.configService.get(
			Secrets.EMAIL_CONFIRMATION_CODE_SECRET, { infer: true })
		return await this.tokensService.createToken(
			{ username, email },
			confirmationCodeSecret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME
		)
	}
}
