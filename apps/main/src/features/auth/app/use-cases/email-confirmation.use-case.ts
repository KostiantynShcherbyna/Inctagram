import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { Secrets } from '../../../../infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'

export class EmailConfirmationCommand {
	constructor(public code: string) {
	}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase
	implements ICommandHandler<EmailConfirmationCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected tokensService: TokensService,
		protected configService: ConfigService<ConfigType, true>
	) {
	}

	async execute(command: EmailConfirmationCommand) {
		const confirmationCode = await this.usersRepository
			.findConfirmationCode(command.code)

		if (confirmationCode === null)
			return new ReturnContract(null, ErrorEnum.CONFIRMATION_CODE_NOT_FOUND)

		const user = await this.usersRepository.findUserById(confirmationCode.userId)

		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)
		if (user.isConfirmed === true)
			return new ReturnContract(null, ErrorEnum.USER_EMAIL_CONFIRMED)

		const confirmationCodeSecret = this.configService
			.get(Secrets.EMAIL_CONFIRMATION_CODE_SECRET, { infer: true })

		const confirmationCodeDto = await this.tokensService
			.verifyToken(command.code, confirmationCodeSecret)

		if (confirmationCodeDto === null)
			return new ReturnContract(null, ErrorEnum.TOKEN_NOT_VERIFY)

		const updateResult = await this.usersRepository
			.updateConfirmation(user.id, true)

		if (!updateResult)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		return new ReturnContract(true, null)
	}
}
