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
import { UsersRepository } from './features/users/rep/users.repository'
import { EmailConfirmationUseCase } from './features/auth/app/use-cases/email-confirmation.use-case'
import { DevicesRepository } from './features/users/rep/devices.repository'
import { TestingController } from '../test/infrastructure/testing.controller'
import { EmailConfirmationResendUseCase } from './features/auth/app/use-cases/email-confirmation-resend.use-case'
import { LoginUseCase } from './features/auth/app/use-cases/login.use-case'
import { LogoutUseCase } from './features/auth/app/use-cases/logout.use-case'
import { NewPasswordUseCase } from './features/auth/app/use-cases/new-password.use-case'
import { PasswordRecoveryUseCase } from './features/auth/app/use-cases/password-recovery.use-case'
import { GoogleLoginUseCase } from './features/auth/app/use-cases/google-login.use-case'
import { GoogleAuthStrategy } from './features/auth/utils/strategies/google-auth.strategy'
import { SessionSerializer } from './infrastructure/utils/session-serializer'
import { GoogleAuthValidator } from './features/auth/utils/validators/google-auth.validator'
import { PassportModule } from '@nestjs/passport'
import { GitHubLoginUseCase } from './features/auth/app/use-cases/github-login.use-case'
import { GithubAuthStrategy } from './features/auth/utils/strategies/github-auth.strategy'
import { GithubAuthValidator } from './features/auth/utils/validators/github-auth.validator'
import { UserPhotoGuard } from './features/users/utils/guards/user-photo.guard'
import { UserController } from './features/users/api/user.controller'
import { UploadPhotoUseCase } from './features/users/app/use-cases/upload-photo.use.case'
import { UserPhotosRepository } from './features/users/rep/user-photos.repository'
import { DeletePhotoUseCase } from './features/users/app/use-cases/delete-photo.use-case'
import { EditProfileUseCase } from './features/users/app/use-cases/edit-profile.use-case'
import { FillProfileUseCase } from './features/users/app/use-cases/fill-profile.use-case'
import { FilesFirebaseAdapter } from './infrastructure/adapters/files.firebase.adapter'

const services = [
	PrismaClient,
	JwtService,
	ConfigService,
	TokensService,
	PrismaService,
	EmailAdapter,
	SessionSerializer,
	UserPhotoGuard,
	// FilesS3Adapter,
	FilesFirebaseAdapter
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
	GoogleLoginUseCase,
	GitHubLoginUseCase,
	UploadPhotoUseCase,
	DeletePhotoUseCase,
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
	{ provide: 'G00GLE_AUTH_SERVICE', useClass: GoogleAuthValidator },
	{ provide: 'GITHUB_AUTH_SERVICE', useClass: GithubAuthValidator }
]

@Module({
	imports: [
		CqrsModule,
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true
		}),
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
