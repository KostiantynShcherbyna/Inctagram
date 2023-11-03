import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Ip,
	Post,
	Req,
	Res,
	ServiceUnavailableException,
	UnauthorizedException,
	UseGuards
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request, Response } from 'express'
import { outputMessageException } from '../../../infrastructure/utils/output-message-exception'
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
		const registrationContract = await this.commandBus.execute(
			new RegistrationCommand(
				bodyRegistration.login,
				bodyRegistration.email,
				bodyRegistration.password)
		)

		if (registrationContract.error === ErrorEnum.USER_EMAIL_EXIST)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.USER_EMAIL_EXIST, 'email'))
		if (registrationContract.error === ErrorEnum.USER_LOGIN_EXIST)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.USER_LOGIN_EXIST, 'login'))
		if (registrationContract.error === ErrorEnum.EXCEPTION)
			throw new ServiceUnavailableException()
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
		const confirmationContract = await this.commandBus
			.execute(new EmailConfirmationCommand(bodyConfirmation.code))

		if (confirmationContract.error === ErrorEnum.CONFIRMATION_CODE_NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.CONFIRMATION_CODE_NOT_FOUND, 'code'))
		if (confirmationContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.USER_NOT_FOUND, 'code'))
		if (confirmationContract.error === ErrorEnum.USER_EMAIL_CONFIRMED)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.USER_EMAIL_CONFIRMED, 'code'))
		if (confirmationContract.error === ErrorEnum.TOKEN_NOT_VERIFY)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.TOKEN_NOT_VERIFY, 'code'))
	}


	@Post('registration-email-resending')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiBadRequestResponse()
	async emailConfirmationResend(
		@Body() bodyConfirmationResend: EmailConfirmationResendBodyInputModel) {
		const confirmationResendContract = await this.commandBus
			.execute(new EmailConfirmationResendCommand(bodyConfirmationResend.email))

		if (confirmationResendContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.USER_NOT_FOUND, 'email'))
		if (confirmationResendContract.error === ErrorEnum.USER_EMAIL_CONFIRMED)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.USER_EMAIL_CONFIRMED, 'email'))
		if (confirmationResendContract.error === ErrorEnum.USER_NOT_DELETED)
			throw new InternalServerErrorException()
		if (confirmationResendContract.error === ErrorEnum.EMAIL_NOT_SENT)
			throw new InternalServerErrorException()
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
		const loginContract = await this.commandBus
			.execute(new LoginCommand(bodyAuth, ip, userAgent))

		if (loginContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new BadRequestException()
		if (loginContract.error === ErrorEnum.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.PASSWORD_NOT_COMPARED)
			throw new UnauthorizedException()

		res.cookie('refreshToken', loginContract.data?.refreshToken, {
			httpOnly: true,
			secure: true
		})
		return loginContract.data?.accessJwt
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
		const logoutContract = await this.commandBus.execute(
			new LogoutCommand(
				deviceSession.id,
				deviceSession.exp,
				deviceSession.ip,
				deviceSession.iat,
				deviceSession.title,
				deviceSession.userId
			)
		)

		if (logoutContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorEnum.DEVICE_NOT_FOUND)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorEnum.DEVICE_NOT_DELETE)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorEnum.TOKEN_NOT_VERIFY)
			throw new UnauthorizedException()

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
		const isRecoveryContract = await this.commandBus
			.execute(new PasswordRecoveryCommand(bodyPasswordRecovery.email))

		if (isRecoveryContract.error === ErrorEnum.EMAIL_NOT_SENT)
			throw new InternalServerErrorException()
		if (isRecoveryContract.error === ErrorEnum.RECOVERY_CODE_NOT_DELETE)
			throw new InternalServerErrorException()
	}


	@Post('new-password')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiBadRequestResponse({
		description: 'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired'
	})
	async newPassword(@Body() bodyNewPassword: NewPasswordBodyInputModel) {
		const newPasswordContract = await this.commandBus.execute(
			new NewPasswordCommand(
				bodyNewPassword.newPassword,
				bodyNewPassword.recoveryCode
			)
		)

		if (newPasswordContract.error === ErrorEnum.TOKEN_NOT_VERIFY)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.TOKEN_NOT_VERIFY, 'recoveryCode'))
		if (newPasswordContract.error === ErrorEnum.RECOVERY_CODE_NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.RECOVERY_CODE_NOT_FOUND, 'recoveryCode'))
		if (newPasswordContract.error === ErrorEnum.RECOVERY_CODE_INVALID)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.RECOVERY_CODE_INVALID, 'recoveryCode'))
		if (newPasswordContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new BadRequestException(outputMessageException(
				ErrorEnum.RECOVERY_CODE_INVALID, 'recoveryCode'))
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
		const refreshTokenContract = await this.commandBus
			.execute(new RefreshTokenCommand(deviceSession, ip, userAgent))

		if (refreshTokenContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (refreshTokenContract.error === ErrorEnum.DEVICE_NOT_FOUND)
			throw new UnauthorizedException()
		if (refreshTokenContract.error === ErrorEnum.TOKEN_NOT_VERIFY)
			throw new UnauthorizedException()

		res.cookie('refreshToken', refreshTokenContract.data?.refreshToken,
			{ httpOnly: true, secure: true })
		return refreshTokenContract.data?.accessJwt
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

		const loginContract = await this.commandBus.execute(
			new GoogleLoginCommand(
				{ email: user.email, username: user.username }
			)
		)

		if (loginContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.USER_IS_BANNED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.PASSWORD_NOT_COMPARED)
			throw new UnauthorizedException()

		res.cookie('refreshToken', loginContract.data?.refreshToken, {
			httpOnly: true,
			secure: true
		})
		return loginContract.data.accessJwt
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

		const loginContract = await this.commandBus.execute(
			new GitHubLoginCommand(
				{ email: user.email, username: user.username }
			)
		)

		if (loginContract.error === ErrorEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.USER_IS_BANNED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorEnum.PASSWORD_NOT_COMPARED)
			throw new UnauthorizedException()

		res.cookie('refreshToken', loginContract.data?.refreshToken, {
			httpOnly: true,
			secure: true
		})
		return loginContract.data.accessJwt
	}


}
