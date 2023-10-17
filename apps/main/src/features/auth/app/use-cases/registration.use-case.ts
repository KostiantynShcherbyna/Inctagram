import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class RegistrationSqlCommand {
	constructor(
		public login: string,
		public email: string,
		public password: string
	) {}
}

@CommandHandler(RegistrationSqlCommand)
export class RegistrationUseCase
	implements ICommandHandler<RegistrationSqlCommand>
{
	async execute(command: RegistrationSqlCommand) {
		return true
	}
}
