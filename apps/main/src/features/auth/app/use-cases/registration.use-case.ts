import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersRepository } from '../../../users/repo/users.repository'
import { ErrorMessageEnum } from '../../../../../../infrastructure/utils/error-message-enum'
import { PrismaClient } from '@prisma/client'
import { ResponseContract } from '../../../../../../infrastructure/utils/response-contract'
import { EmailAdapter } from '../../../../../../infrastructure/adapters/email.adapter'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../../../infrastructure/configurations/configuration'
import { TokensService } from '../../../../../../infrastructure/services/tokens.service'
import { UserEntity } from '../../../../../../../prisma/domain/user.entity'

export class RegistrationCommand {
	constructor(
		public login: string,
		public email: string,
		public password: string
	) {
	}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
	constructor(
		protected prisma: PrismaClient,
		protected configService: ConfigService<ConfigType, true>,
		protected tokensService: TokensService,
		protected usersRepository: UsersRepository,
		protected emailAdapter: EmailAdapter
	) {
	}

	async execute(command: RegistrationCommand) {
		const user = await this.usersRepository.findUserByUserNameOrEmail(
			command.login,
			command.email
		)
		if (user?.username === command.login)
			return new ResponseContract(null, ErrorMessageEnum.USER_LOGIN_EXIST)
		if (user?.email === command.email)
			return new ResponseContract(null, ErrorMessageEnum.USER_EMAIL_EXIST)

		const userInstance = new UserEntity(this.prisma.user)

		const userDto = {
			username: command.login,
			email: command.email,
			password: command.password,
			configService: this.configService,
			tokensService: this.tokensService
		}

		const newUser = await this.usersRepository.createUser(userInstance, userDto)

		this.emailAdapter.sendConfirmationCode(newUser)

		return new ResponseContract(true, null)
	}
}
