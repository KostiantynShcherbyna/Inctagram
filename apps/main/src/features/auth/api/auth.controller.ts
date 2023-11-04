import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	HttpException,
	HttpStatus,
	Injectable,
	Ip,
	Post,
	Req,
	Res,
	UseGuards
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request, Response } from 'express'
import { ErrorEnum } from '../../../infrastructure/utils/error-enum'
import { RegistrationCommand } from '../app/use-cases/registration.use-case'
import { EmailConfirmationResendBodyInputModel } from '../utils/models/input/email-confirmation-resend.body.input-model'
import { EmailConfirmationResendCommand } from '../app/use-cases/email-confirmation-resend.use-case'
import { ConfirmationBodyInputModel } from '../utils/models/input/confirmation.body.input-model'
import { EmailConfirmationCommand } from '../app/use-cases/email-confirmation.use-case'
import { LoginBodyInputModel } from '../utils/models/input/login.body.input-model'
import { LoginCommand } from '../app/use-cases/login.use-case'
import { RefreshGuard } from '../../../infrastructure/middlewares/auth/guards/refresh.guard'
import { DeviceSessionGuard } from '../../../infrastructure/middlewares/auth/guards/device-session.guard'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input-model'
import { LogoutCommand } from '../app/use-cases/logout.use-case'
import { PasswordRecoveryBodyInputModel } from '../utils/models/input/password-recovery.body.input-model'
import { PasswordRecoveryCommand } from '../app/use-cases/password-recovery.use-case'
import { NewPasswordBodyInputModel } from '../utils/models/input/new-password.body.input-model'
import { NewPasswordCommand } from '../app/use-cases/new-password.use-case'
import { GoogleAuthGuard } from '../../../infrastructure/middlewares/auth/guards/google-auth.guard'
import { GitHubAuthGuard } from '../../../infrastructure/middlewares/auth/guards/github-auth.guard'
import { GitHubLoginCommand } from '../app/use-cases/github-login.use-case'
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { BadResponse, ValidResponse } from '../../../infrastructure/utils/constants'
import { GoogleLoginCommand } from '../app/use-cases/google-login.use-case'
import { RefreshTokenCommand } from '../app/use-cases/refresh-token.use-case'
import { RegistrationBodyInputModel } from '../utils/models/input/registration.body.input-model'
import { UserDetails } from '../../../infrastructure/types/auth.types'

@Injectable()
@Controller('auth')
export class AuthController {
	constructor(protected commandBus: CommandBus) {
	}

	@Post('registration')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		description: ValidResponse.REGISTRATION,
		status: HttpStatus.NO_CONTENT
	})
	@ApiBadRequestResponse({ description: BadResponse.REGISTRATION })
	async registration(@Body() bodyRegistration: RegistrationBodyInputModel) {
		const registrationResult = await this.commandBus.execute(
			new RegistrationCommand(
				bodyRegistration.login,
				bodyRegistration.email,
				bodyRegistration.password
			)
		)

		if (registrationResult === ErrorEnum.LOGIN_EXIST)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (registrationResult === ErrorEnum.EMAIL_EXIST)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
	}


	@Post('registration-confirmation')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		description: ValidResponse.REGISTRATION_CONFIRMATION,
		status: HttpStatus.NO_CONTENT
	})
	@ApiBadRequestResponse(
		{ description: BadResponse.REGISTRATION_CONFIRMATION })
	async emailConfirmation(
		@Body() bodyConfirmation: ConfirmationBodyInputModel) {
		const confirmationResult = await this.commandBus
			.execute(new EmailConfirmationCommand(bodyConfirmation.code))

		if (confirmationResult === ErrorEnum.CONFIRMATION_CODE_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (confirmationResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (confirmationResult === ErrorEnum.EMAIL_CONFIRMED)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)
		if (confirmationResult === ErrorEnum.INVALID_TOKEN)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 414)
	}


	@Post('registration-email-resending')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiBadRequestResponse()
	async emailConfirmationResend(
		@Body() bodyConfirmationResend: EmailConfirmationResendBodyInputModel) {
		const resendResult = await this.commandBus
			.execute(new EmailConfirmationResendCommand(bodyConfirmationResend.email))

		if (resendResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (resendResult === ErrorEnum.EMAIL_CONFIRMED)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
	}


	@Post('login')
	// @UseGuards(AuthGuard(StrategyNames.loginLocalStrategy))
	@ApiOperation({ summary: 'Try to login user to the system' })
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiBadRequestResponse({ description: 'If the inputModel has incorrect values' })
	@ApiUnauthorizedResponse({ description: 'If the password or login is wrong' })
	@HttpCode(HttpStatus.OK)
	async login(
		@Headers('user-agent') userAgent: string,
		@Ip() ip: string,
		@Body() bodyAuth: LoginBodyInputModel,
		@Res({ passthrough: true }) res: Response
	) {
		const loginResult = await this.commandBus
			.execute(new LoginCommand(bodyAuth, ip, userAgent))

		if (loginResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (loginResult === ErrorEnum.EMAIL_NOT_CONFIRMED)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (loginResult === ErrorEnum.INVALID_PASSWORD)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)

		res.cookie('refreshToken', loginResult.refreshToken, {
			httpOnly: true,
			secure: true
		})
		return loginResult.accessJwt
	}


	@UseGuards(RefreshGuard)
	@Post('logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiUnauthorizedResponse({
		description: 'If the JWT refreshToken inside cookie is missing, expired or incorrect'
	})
	async logout(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Res({ passthrough: true }) res: Response
	) {
		const logoutResult = await this.commandBus.execute(
			new LogoutCommand(
				deviceSession.id,
				deviceSession.exp,
				deviceSession.ip,
				deviceSession.iat,
				deviceSession.title,
				deviceSession.userId
			)
		)

		if (logoutResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (logoutResult === ErrorEnum.DEVICE_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (logoutResult === ErrorEnum.INVALID_TOKEN)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)

		res.clearCookie('refreshToken') // TODO todo not delete device
	}


	@Post('password-recovery')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		description: 'Even if current email is not registered (for prevent user\'s email detection)',
		status: HttpStatus.NO_CONTENT
	})
	@ApiBadRequestResponse({
		description: 'If the inputModel has invalid email (for example 222^gmail.com)'
	})
	async passwordRecovery(
		@Body() bodyPasswordRecovery: PasswordRecoveryBodyInputModel
	) {
		await this.commandBus
			.execute(new PasswordRecoveryCommand(bodyPasswordRecovery.email))
	}


	@Post('new-password')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiBadRequestResponse({
		description: 'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired'
	})
	async newPassword(@Body() bodyNewPassword: NewPasswordBodyInputModel) {
		const newPasswordResponse = await this.commandBus.execute(
			new NewPasswordCommand(
				bodyNewPassword.newPassword,
				bodyNewPassword.recoveryCode
			)
		)

		if (newPasswordResponse === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (newPasswordResponse === ErrorEnum.INVALID_TOKEN)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (newPasswordResponse === ErrorEnum.RECOVERY_CODE_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)
		if (newPasswordResponse === ErrorEnum.INVALID_RECOVERY_CODE)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 414)
	}


	@UseGuards(RefreshGuard)
	@Post('refresh-token')
	@HttpCode(HttpStatus.OK)
	async refreshToken(
		@DeviceSessionGuard() deviceSession: DeviceSessionHeaderInputModel,
		@Headers('user-agent') userAgent: string,
		@Ip() ip: string,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenResult = await this.commandBus
			.execute(new RefreshTokenCommand(deviceSession, ip, userAgent))

		if (refreshTokenResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (refreshTokenResult === ErrorEnum.DEVICE_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (refreshTokenResult === ErrorEnum.INVALID_TOKEN)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)

		res.cookie('refreshToken', refreshTokenResult.refreshToken,
			{ httpOnly: true, secure: true })
		return refreshTokenResult.accessJwt
	}


	@Get('status')
	@ApiResponse({ status: HttpStatus.OK })
	user(@Req() request: Request) {
		console.log(request.user)
		return request.user
			? { msg: 'Authenticated' }
			: { msg: 'Not Authenticated' }
	}


	@Get('google/login')
	@UseGuards(GoogleAuthGuard)
	@ApiResponse({ status: HttpStatus.OK })
	async googleLogin() {
		return { msg: 'Google Auth' }
	}


	@Get('google/redirect')
	@UseGuards(GoogleAuthGuard)
	@ApiResponse({ status: HttpStatus.OK })
	async googleRedirect(
		@Req() request: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const user: Partial<UserDetails> = request.user

		const loginResult = await this.commandBus.execute(
			new GoogleLoginCommand(
				{ email: user.email, username: user.username })
		)

		if (loginResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (loginResult === ErrorEnum.EMAIL_NOT_CONFIRMED)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (loginResult === ErrorEnum.INVALID_PASSWORD)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)

		res.cookie('refreshToken', loginResult.refreshToken, {
			httpOnly: true,
			secure: true
		})
		return loginResult.accessJwt
	}


	@Get('github/login')
	@UseGuards(GitHubAuthGuard)
	@ApiResponse({ status: HttpStatus.OK })
	async githubLogin() {
		return { msg: 'GitHub Auth' }
	}


	@Get('github/redirect')
	@UseGuards(GitHubAuthGuard)
	@ApiResponse({ status: HttpStatus.OK })
	async githubRedirect(
		@Req() request: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const user: Partial<UserDetails> = request.user

		const loginResult = await this.commandBus.execute(
			new GitHubLoginCommand(
				{ email: user.email, username: user.username })
		)

		if (loginResult === ErrorEnum.USER_NOT_FOUND)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 411)
		if (loginResult === ErrorEnum.EMAIL_NOT_CONFIRMED)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 412)
		if (loginResult === ErrorEnum.INVALID_PASSWORD)
			throw new HttpException(ErrorEnum.UNAUTHORIZED, 413)

		res.cookie('refreshToken', loginResult.refreshToken, {
			httpOnly: true,
			secure: true
		})
		return loginResult.accessJwt
	}


}
