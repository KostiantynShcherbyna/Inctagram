import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/repo/users.repository'
import { ResponseContract } from '../../../../../../infrastructure/utils/response-contract'
import { ErrorMessageEnum } from '../../../../../../infrastructure/utils/error-message-enum'
import { TokensService } from '../../../../../../infrastructure/services/tokens.service'
import { ExpiresTime } from '../../../../../../infrastructure/utils/constants'

export class EmailConfirmationCommand {
	constructor(public code: string) {
	}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmation
	implements ICommandHandler<EmailConfirmationCommand> {
	constructor(
		protected usersRepository: UsersRepository,
		protected tokensService: TokensService
	) {
	}

	async execute(command: EmailConfirmationCommand) {
		const user = await this.usersRepository.findUserByConfirmationCode(
			command.code)

		if (user === null)
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)

		if (user.isConfirmed === true)
			return new ResponseContract(null, ErrorMessageEnum.USER_EMAIL_CONFIRMED)

		const confirmationCodeDto = await this.tokensService.verifyToken(
			command.code,
			ExpiresTime.EMAIL_CONFIRMATION_CODE_EXP_TIME)

		if (confirmationCodeDto.exp < new Date(Date.now()))
			return new ResponseContract(null, ErrorMessageEnum.CONFIRMATION_CODE_EXPIRED)

		const updateResult = await this.usersRepository.updateConfirmation(user.id, true)

		if (!updateResult)
			return new ResponseContract(null, ErrorMessageEnum.USER_NOT_FOUND)

		return new ResponseContract(true, null)
	}
}
