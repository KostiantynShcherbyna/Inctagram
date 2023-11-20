import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CommandBus, CqrsModule } from '@nestjs/cqrs'
import { PrismaClient } from '@prisma/client'
import { UsersController } from './api/users.controller'
import { PrismaService } from '../../prisma.service'
import { UploadAvatarUseCase } from './app/use-cases/upload-avatar.use-case'
import { FirebaseAdapter } from '../../infrastructure/adapters/firebase.adapter'
import { Base64Service } from '../../infrastructure/services/base64.service'
import { DeleteAvatarUseCase } from './app/use-cases/delete-avatar.use-case'


@Module({
	imports: [CqrsModule],
	controllers: [UsersController],
	providers: [
		PrismaClient,
		PrismaService,
		JwtService,
		ConfigService,
		UploadAvatarUseCase,
		FirebaseAdapter,
		Base64Service,
		UploadAvatarUseCase,
		DeleteAvatarUseCase,
	]
})
export class UsersModule {
}
