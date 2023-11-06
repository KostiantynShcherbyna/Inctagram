import { Module } from '@nestjs/common'
import { MediaController } from './features/api/media.controller'
import { TokensService } from './infrastructure/services/tokens.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CommandBus } from '@nestjs/cqrs'

@Module({
	imports: [],
	controllers: [MediaController],
	providers: [CommandBus, TokensService, JwtService, ConfigService]
})
export class MediaModule {
}
