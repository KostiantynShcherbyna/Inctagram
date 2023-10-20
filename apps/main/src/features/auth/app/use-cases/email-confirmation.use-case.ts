import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/repo/users.repository'
import { ResponseContract } from '../../../../../../infrastructure/utils/response-contract'
import { ErrorMessageEnum } from '../../../../../../infrastructure/utils/error-message-enum'
import { TokensService } from '../../../../../../infrastructure/services/tokens.service'
import { Secrets } from '../../../../../../infrastructure/utils/constants'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../../../infrastructure/configurations/configuration'

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
		const user = await this.usersRepository.findUserByConfirmationCode(
			command.code)

		if (user === null)
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)
		if (user.isConfirmed === true)
			return new ResponseContract(null, ErrorMessageEnum.USER_EMAIL_CONFIRMED)

		const confirmationCodeSecret = this.configService.get(
			Secrets.EMAIL_CONFIRMATION_CODE_SECRET,
			{ infer: true }
		)

		const confirmationCodeDto = await this.tokensService.verifyToken(
			command.code,
			confirmationCodeSecret)

		if (confirmationCodeDto === null)
			return new ResponseContract(null, ErrorMessageEnum.TOKEN_NOT_VERIFY)
		if (confirmationCodeDto.exp < new Date(Date.now()))
			return new ResponseContract(null, ErrorMessageEnum.CONFIRMATION_CODE_EXPIRED)

		const updateResult = await this.usersRepository.updateConfirmation(user.id, true)

		if (!updateResult)
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)

		return new ResponseContract(true, null)
	}
}
