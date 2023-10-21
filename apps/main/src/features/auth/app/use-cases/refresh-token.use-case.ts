import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConfigService, ConfigType } from '@nestjs/config'
import { DeviceSessionHeaderInputModel } from '../../utils/models/input/device-session.header.input-model'

export class RefreshTokenCommand {
	constructor(
		public deviceSession: DeviceSessionHeaderInputModel,
		public deviceIp: string,
		public userAgent: string
	) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
	implements ICommandHandler<RefreshTokenCommand>
{
	constructor(protected configService: ConfigService<ConfigType<any>, true>) {}

	async execute(command: RefreshTokenCommand) {
		return
	}
}
