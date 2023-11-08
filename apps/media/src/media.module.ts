import { Module } from '@nestjs/common'
import { MediaController } from './features/users/api/media.controller'
import { TokensService } from './infrastructure/services/tokens.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { UploadAvatarUseCase } from './features/users/app/use-cases/upload-avatar.use-case'
import { UploadPostImageUseCase } from './features/users/app/use-cases/upload-post-image.use.case'
import { FirebaseAdapter } from './infrastructure/adapters/firebase.adapter'
import { PrismaClient } from '@prisma/client'
import { Base64Service } from './infrastructure/services/base64.service'
import { PrismaService } from '../../main/src/prisma.service'

@Module({
	imports: [CqrsModule],
	controllers: [MediaController],
	providers: [
		PrismaClient,
		PrismaService,
		TokensService,
		JwtService,
		ConfigService,
		UploadAvatarUseCase,
		UploadPostImageUseCase,
		FirebaseAdapter,
		Base64Service,

	]
})
export class MediaModule {
}
