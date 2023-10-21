import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class PasswordRecoveryCommand {
	constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
	implements ICommandHandler<PasswordRecoveryCommand>
{
	// constructor() {}

	async execute(command: PasswordRecoveryCommand) {
		return
	}
}
