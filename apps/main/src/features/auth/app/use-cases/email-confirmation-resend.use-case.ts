import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/rep/users.repository'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { ExpiresTime } from '../../../../infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

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
		protected configService: ConfigService,
		protected tokensService: TokensService
	) {
	}

	async execute(command: EmailConfirmationResendCommand) {
		const env = this.configService.get<IEnvConfig>('env')

		const user = await this.usersRepository.findUserByEmail(command.email)
		if (user === null) return ErrorEnum.USER_NOT_FOUND
		if (user.isConfirmed === true) return ErrorEnum.EMAIL_CONFIRMED

		const newConfirmationCode = await this.createNewConfirmationCode(
			user.username,
			user.email,
			env.EMAIL_CONFIRMATION_CODE_SECRET
		)

		const confirmationCode = await this.usersRepository
			.createConfirmationCode(user.id, newConfirmationCode)

		await this.emailAdapter
			.sendConfirmationCode(user.email, confirmationCode.confirmationCode)

		return
	}

	private async createNewConfirmationCode(
		username: string, email: string, secret: string): Promise<string> {
		return await this.tokensService.createToken(
			{ username, email },
			secret,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME
		)
	}
}
