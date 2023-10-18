import { Module } from '@nestjs/common'
import { PostController } from './features/posts/api/post.controller'
import { PostService } from './features/posts/app/post.service'
import { UserService } from './features/users/app/user.service'
import { PrismaService } from './prisma.service'
import { AuthController } from './features/auth/api/auth.controller'
import { RegistrationUseCase } from './features/auth/app/use-cases/registration.use-case'
import { CommandBus } from '@nestjs/cqrs'
import { TokensService } from '../../infrastructure/services/tokens.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RefreshTokenUseCase } from './features/auth/app/use-cases/refresh-token.use-case'
import { PrismaClient } from '@prisma/client'
import { UsersRepository } from './features/users/repo/users.repository'
import { EmailAdapter } from '../../infrastructure/adapters/email.adapter'

const services = [
	PrismaClient,
	JwtService,
	ConfigService,
	TokensService,
	CommandBus,
	PrismaService,
	PostService,
	UserService,
	EmailAdapter
]
const controllers = [PostController, AuthController]
const usecases = [RegistrationUseCase, RefreshTokenUseCase]
const repository = [UsersRepository]

@Module({
	imports: [],
	controllers: [...controllers],
	providers: [...services, ...usecases, ...repository]
})
export class AppModule {}
