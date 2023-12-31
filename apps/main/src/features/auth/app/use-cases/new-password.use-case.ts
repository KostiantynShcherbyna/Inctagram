import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { UsersRepository } from '../../../users/rep/users.repository'
import { HashService } from '../../../../infrastructure/services/hash.service'
import { IEnvConfig } from '../../../../infrastructure/settings/env.settings'

export class NewPasswordCommand {
	constructor(public newPassword: string, public recoveryCode: string) {
	}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
	implements ICommandHandler<NewPasswordCommand> {
	constructor(
		protected configService: ConfigService,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected hashService: HashService
	) {
	}

	async execute(command: NewPasswordCommand) {
		const env = this.configService.get<IEnvConfig>('env')

		const verifiedEmailDto = await this.tokensService.verifyToken(
			command.recoveryCode, env.PASSWORD_RECOVERY_CODE_SECRET)

		if (verifiedEmailDto === null) return ErrorEnum.INVALID_TOKEN

		const lastRecoveryCodeDto = await this.usersRepository
			.findActivePasswordRecoveryCodeByEmail(verifiedEmailDto.email)

		if (lastRecoveryCodeDto === null) return ErrorEnum.RECOVERY_CODE_NOT_FOUND
		if (lastRecoveryCodeDto.recoveryCode !== command.recoveryCode)
			return ErrorEnum.INVALID_RECOVERY_CODE


		const user = await this.usersRepository.findUserByEmail(verifiedEmailDto.email)

		if (user === null) return ErrorEnum.USER_NOT_FOUND

		const newPasswordHash = await this.hashService.encryption(command.newPassword)

		await this.usersRepository.updatePasswordHash(user.id, newPasswordHash)
		await this.usersRepository.deactivatePasswordRecoveryCode(lastRecoveryCodeDto.id)

		return
	}
}
