import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../infrastructure/configurations/configuration'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/repo/users.repository'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { ResponseContract } from '../../../../infrastructure/utils/response-contract'

export class PasswordRecoveryCommand {
	constructor(public email: string) {
	}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
	implements ICommandHandler<PasswordRecoveryCommand> {
	constructor(
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter
	) {
	}

	async execute(command: PasswordRecoveryCommand) {
		const passwordRecoveryCodeSecret = this.configService
			.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })

		const recoveryCode = await this.usersRepository
			.findActivePasswordRecoveryCodeByEmail(command.email)
		if (recoveryCode !== null) await this.usersRepository
			.deactivatePasswordRecoveryCode(recoveryCode.id)

		const newPasswordRecoveryCode = await this.tokensService
			.createToken(
				{ email: command.email },
				passwordRecoveryCodeSecret,
				ExpiresTime.PASSWORD_HASH_EXPIRES_TIME
			)

		const newRecoveryCode = await this.usersRepository
			.createPasswordRecoveryCode({
				email: command.email,
				recoveryCode: newPasswordRecoveryCode,
				active: true
			})
		console.log('newRecoveryCode', newRecoveryCode)
		this.emailAdapter.sendPasswordRecovery(newRecoveryCode.email, newRecoveryCode.recoveryCode)

		return new ResponseContract(true, null)
	}
}
