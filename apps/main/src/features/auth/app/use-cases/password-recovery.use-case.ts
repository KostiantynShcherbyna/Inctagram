import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { UsersRepository } from '../../../users/rep/users.repository'
import { ExpiresTime, Secrets } from '../../../../infrastructure/utils/constants'
import { EmailAdapter } from '../../../../infrastructure/adapters/email.adapter'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

export class PasswordRecoveryCommand {
	constructor(public email: string) {
	}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
	implements ICommandHandler<PasswordRecoveryCommand> {
	constructor(
		protected configService: ConfigService,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter
	) {
	}

	async execute(command: PasswordRecoveryCommand) {
		const env = this.configService.get<IEnvConfig>('env')

		const passwordRecoveryCode = await this.usersRepository
			.findActivePasswordRecoveryCodeByEmail(command.email)
		if (passwordRecoveryCode !== null) await this.usersRepository
			.deactivatePasswordRecoveryCode(passwordRecoveryCode.id)

		const newPasswordRecoveryCode = await this.tokensService
			.createToken(
				{ email: command.email },
				env.PASSWORD_RECOVERY_CODE_SECRET,
				ExpiresTime.PASSWORD_HASH_EXPIRES_TIME
			)

		const newPasswordRecoveryCodeResult = await this.usersRepository
			.createPasswordRecoveryCode({
				email: command.email,
				recoveryCode: newPasswordRecoveryCode,
				active: true
			})
		console.log('newPasswordRecoveryCode', newPasswordRecoveryCode)
		await this.emailAdapter.sendPasswordRecovery(
			newPasswordRecoveryCodeResult.email,
			newPasswordRecoveryCodeResult.recoveryCode
		)

		return
	}
}
