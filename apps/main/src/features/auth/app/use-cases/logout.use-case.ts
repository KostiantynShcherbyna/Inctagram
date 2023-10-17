import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class LogoutCommand {
	constructor(
		public deviceId: string,
		public expireAt: Date,
		public ip: string,
		public lastActiveDate: string,
		public title: string,
		public userId: string
	) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
	// constructor() {}

	async execute(command: LogoutCommand) {
		return
	}
}
