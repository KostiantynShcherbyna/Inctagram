import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginBodyInputModel } from '../../utils/models/input/login.body.input-model'

export class LoginCommand {
	constructor(
		public loginBody: LoginBodyInputModel,
		public deviceIp: string,
		public userAgent: string
	) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
	// constructor() {}

	async execute(command: LoginCommand) {
		return
	}
}
