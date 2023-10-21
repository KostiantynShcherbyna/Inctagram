import { Module } from '@nestjs/common'
import { PostController } from './features/posts/api/post.controller'
import { PostService } from './features/posts/app/post.service'
import { UserService } from './features/users/app/user.service'
import { PrismaService } from './prisma.service'
import { CqrsModule } from '@nestjs/cqrs'
import { TokensService } from './infrastructure/services/tokens.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'
import { EmailAdapter } from './infrastructure/adapters/email.adapter'
import { AuthController } from './features/auth/api/auth.controller'
import { RefreshTokenUseCase } from './features/auth/app/use-cases/refresh-token.use-case'
import { RegistrationUseCase } from './features/auth/app/use-cases/registration.use-case'
import { UsersRepository } from './features/users/repo/users.repository'
import { EmailConfirmationUseCase } from './features/auth/app/use-cases/email-confirmation.use-case'

const services = [
	PrismaClient,
	JwtService,
	ConfigService,
	TokensService,
	PrismaService,
	PostService,
	UserService,
	EmailAdapter
]
const controllers = [PostController, AuthController]
const usecases = [RegistrationUseCase, EmailConfirmationUseCase, RefreshTokenUseCase]
const repository = [UsersRepository]

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CqrsModule
	],
	controllers: [...controllers],
	providers: [...services, ...usecases, ...repository]
})
export class AppModule {
}
