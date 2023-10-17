import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class EmailConfirmationResendCommand {
	constructor(public email: string) {}
}

@CommandHandler(EmailConfirmationResendCommand)
export class EmailConfirmationResendUseCase
	implements ICommandHandler<EmailConfirmationResendCommand>
{
	// constructor() {}

	async execute(command: EmailConfirmationResendCommand) {
		return
	}
}
