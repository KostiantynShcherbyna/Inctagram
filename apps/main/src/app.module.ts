import { Module } from '@nestjs/common'
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
import { GoogleStrategy } from './features/auth/utils/strategies/google.strategy'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './features/auth/app/services/auth.service'
import { SessionSerializer } from './features/auth/utils/session-serializer'
import { OAuthUseCase } from './features/auth/app/use-cases/OAuth-login.use-case'
import { EmailConfirmationUseCase } from './features/auth/app/use-cases/email-confirmation.use-case'

const services = [
	PrismaClient,
	JwtService,
	ConfigService,
	TokensService,
	PrismaService,
	UserService,
	EmailAdapter
]

const controllers = [AuthController]
const useCases = [RegistrationUseCase, RefreshTokenUseCase, OAuthUseCase]
const usecases = [
	RegistrationUseCase,
	EmailConfirmationUseCase,
	RefreshTokenUseCase
]
const repository = [UsersRepository]
const strategies = [GoogleStrategy]

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CqrsModule,
		PassportModule.register({ session: true })
	],
	controllers: [...controllers],
	providers: [
		...services,
		...useCases,
		...repository,
		...strategies,
		SessionSerializer,
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService
		}
	]
})
export class AppModule {}
