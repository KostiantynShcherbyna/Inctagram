import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class EmailConfirmationCommand {
	constructor(public code: string) {}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmation implements ICommandHandler<EmailConfirmationCommand> {
	// constructor() {}

	async execute(command: EmailConfirmationCommand) {
		return
	}
}
