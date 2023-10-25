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
import { EmailConfirmationUseCase } from './features/auth/app/use-cases/email-confirmation.use-case'
import { DevicesRepository } from './features/users/repo/devices.repository'
import { TestingController } from '../test/infrastructure/testing.controller'
import { EmailConfirmationResendUseCase } from './features/auth/app/use-cases/email-confirmation-resend.use-case'
import { LoginUseCase } from './features/auth/app/use-cases/login.use-case'
import { LogoutUseCase } from './features/auth/app/use-cases/logout.use-case'
import { NewPasswordUseCase } from './features/auth/app/use-cases/new-password.use-case'
import { PasswordRecoveryUseCase } from './features/auth/app/use-cases/password-recovery.use-case'
import { OAuthGoogleUseCase } from './features/auth/app/use-cases/oAuth-google-login.use-case'
import { GoogleAuthStrategy } from './infrastructure/strategies/google-auth.strategy'
import { SessionSerializer } from './infrastructure/utils/session-serializer'
import { GoogleAuthService } from './features/auth/app/services/google-auth.service'
import { PassportModule } from '@nestjs/passport'
import { OAuthGitHubUseCase } from './features/auth/app/use-cases/oAuth-github-login.use-case'
import { GithubAuthStrategy } from './infrastructure/strategies/github-auth.strategy'
import { GitHubAuthService } from './features/auth/app/services/github-auth.service'

const services = [
	PrismaClient,
	JwtService,
	ConfigService,
	TokensService,
	PrismaService,
	UserService,
	EmailAdapter,
	SessionSerializer
]
const controllers = [AuthController, TestingController]
const useCases = [
	RegistrationUseCase,
	EmailConfirmationUseCase,
	RefreshTokenUseCase,
	EmailConfirmationResendUseCase,
	LoginUseCase,
	LogoutUseCase,
	NewPasswordUseCase,
	PasswordRecoveryUseCase,
	OAuthGoogleUseCase,
	OAuthGitHubUseCase
]
const repository = [UsersRepository, DevicesRepository]
const strategies = [GoogleAuthStrategy, GithubAuthStrategy]
const providers = [
	{ provide: 'G00GLE_AUTH_SERVICE', useClass: GoogleAuthService },
	{ provide: 'GITHUB_AUTH_SERVICE', useClass: GitHubAuthService }
]

@Module({
	imports: [
		CqrsModule,
		ConfigModule.forRoot({ isGlobal: true }),
		PassportModule.register({ session: true })
	],
	controllers: [...controllers],
	providers: [
		...providers,
		...services,
		...useCases,
		...repository,
		...strategies
	]
})
export class AppModule {
}
