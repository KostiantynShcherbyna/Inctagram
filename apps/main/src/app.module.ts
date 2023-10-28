import { Module } from '@nestjs/common'
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
import { UserPhotoPipe } from './infrastructure/pipes/user-photo.pipe'
import { UserController } from './features/users/api/user.controller'
import { UploadPhotoS3UseCase } from './features/users/app/use-cases/upload-photo.s3.use-case'
import { FilesS3Adapter } from './infrastructure/adapters/files-s3.adapter'
import { UserPhotosRepository } from './features/users/repo/user-photos.repository'
import { DeletePhotoS3UseCase } from './features/users/app/use-cases/delete-photo.s3.use-case'
import { EditProfileUseCase } from './features/users/app/use-cases/edit-profile.use-case'
import { FillProfileUseCase } from './features/users/app/use-cases/fill-profile.use-case'

const services = [
	PrismaClient,
	JwtService,
	ConfigService,
	TokensService,
	PrismaService,
	EmailAdapter,
	SessionSerializer,
	UserPhotoPipe,
	FilesS3Adapter
]
const controllers = [
	AuthController,
	TestingController,
	UserController
]
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
	OAuthGitHubUseCase,
	UploadPhotoS3UseCase,
	DeletePhotoS3UseCase,
	EditProfileUseCase,
	FillProfileUseCase
]
const repository = [
	UsersRepository,
	DevicesRepository,
	UserPhotosRepository
]
const strategies = [
	GoogleAuthStrategy,
	GithubAuthStrategy
]
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
