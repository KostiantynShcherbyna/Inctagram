import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class NewPasswordCommand {
	constructor(public newPassword: string, public recoveryCode: string) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
	// constructor() {}

	async execute(command: NewPasswordCommand) {
		return
	}
}
