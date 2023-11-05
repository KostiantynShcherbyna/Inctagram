import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/rep/users.repository'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { ConfigService } from '@nestjs/config'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

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
		protected configService: ConfigService
	) {
	}

	async execute(command: EmailConfirmationCommand) {
		const env = this.configService.get<IEnvConfig>('env')

		const confirmationCode = await this.usersRepository
			.findConfirmationCode(command.code)

		if (confirmationCode === null)
			return new ReturnContract(null, ErrorEnum.CONFIRMATION_CODE_NOT_FOUND)

		const user = await this.usersRepository.findUserById(confirmationCode.userId)

		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)
		if (user.isConfirmed === true)
			return new ReturnContract(null, ErrorEnum.EMAIL_CONFIRMED)

		const confirmationCodeDto = await this.tokensService
			.verifyToken(command.code, env.EMAIL_CONFIRMATION_CODE_SECRET)

		if (confirmationCodeDto === null)
			return new ReturnContract(null, ErrorEnum.INVALID_TOKEN)

		const updateResult = await this.usersRepository
			.updateConfirmation(user.id, true)

		if (!updateResult)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		return new ReturnContract(true, null)
	}
}
