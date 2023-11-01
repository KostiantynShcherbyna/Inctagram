import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '@nestjs/config'
import { Secrets } from '../../../../infrastructure/utils/constants'
import { ConfigType } from '../../../../infrastructure/settings/custom-settings'
import { TokensService } from '../../../../infrastructure/services/tokens.service'
import { ReturnContract } from '../../../../infrastructure/utils/return-contract'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'
import { UsersRepository } from '../../../users/rep/users.repository'
import { HashService } from '../../../../infrastructure/services/hash.service'

export class NewPasswordCommand {
	constructor(public newPassword: string, public recoveryCode: string) {
	}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
	implements ICommandHandler<NewPasswordCommand> {
	constructor(
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected hashService: HashService
	) {
	}

	async execute(command: NewPasswordCommand) {

		const passwordRecoveryCodeSecret = this.configService.get(
			Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })

		const verifiedEmailDto = await this.tokensService.verifyToken(
			command.recoveryCode, passwordRecoveryCodeSecret)

		if (verifiedEmailDto === null)
			return new ReturnContract(null, ErrorEnum.TOKEN_NOT_VERIFY)

		const lastRecoveryCodeDto = await this.usersRepository.findActivePasswordRecoveryCodeByEmail(
			verifiedEmailDto.email)

		if (lastRecoveryCodeDto === null)
			return new ReturnContract(null, ErrorEnum.RECOVERY_CODE_NOT_FOUND)
		if (lastRecoveryCodeDto.recoveryCode !== command.recoveryCode)
			return new ReturnContract(null, ErrorEnum.RECOVERY_CODE_INVALID)


		const user = await this.usersRepository.findUserByEmail(verifiedEmailDto.email)

		if (user === null)
			return new ReturnContract(null, ErrorEnum.USER_NOT_FOUND)

		const newPasswordHash = await this.hashService.encryption(command.newPassword)

		await this.usersRepository.updatePasswordHash(user.id, newPasswordHash)
		await this.usersRepository.deactivatePasswordRecoveryCode(lastRecoveryCodeDto.id)

		return new ReturnContract(true, null)
	}
}
