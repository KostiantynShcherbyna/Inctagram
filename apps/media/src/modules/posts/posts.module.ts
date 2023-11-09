import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from '../../prisma.service'
import { TokensService } from '../../infrastructure/services/tokens.service'
import { FirebaseAdapter } from '../../infrastructure/adapters/firebase.adapter'
import { Base64Service } from '../../infrastructure/services/base64.service'
import { PostsController } from './api/posts.controller'
import { UploadPostImageUseCase } from './app/use-cases/upload-post-image.use.case'


@Module({
	imports: [CqrsModule],
	controllers: [PostsController],
	providers: [
		PrismaClient,
		PrismaService,
		TokensService,
		JwtService,
		ConfigService,
		FirebaseAdapter,
		Base64Service,
		UploadPostImageUseCase
	]
})
export class PostsModule {
}
