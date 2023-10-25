import {
	BadRequestException,
	Body,
	Controller,
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
import { ErrorMessageEnum } from '../../../infrastructure/utils/error-message-enum'
import { RegistrationCommand } from '../app/use-cases/registration.use-case'
import { EmailConfirmationResendBodyInputModel } from '../utils/models/input/email-confirmation-resend.body.input-model'
import { EmailConfirmationResendCommand } from '../app/use-cases/email-confirmation-resend.use-case'
import { ConfirmationBodyInputModel } from '../utils/models/input/confirmation.body.input-model'
import { EmailConfirmationCommand } from '../app/use-cases/email-confirmation.use-case'
import { LoginBodyInputModel } from '../utils/models/input/login.body.input-model'
import { LoginCommand } from '../app/use-cases/login.use-case'
import { RefreshGuard } from '../../../infrastructure/guards/refresh.guard'
import { DeviceSession } from '../../../infrastructure/decorators/device-session.decorator'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input-model'
import { LogoutCommand } from '../app/use-cases/logout.use-case'
import { PasswordRecoveryBodyInputModel } from '../utils/models/input/password-recovery.body.input-model'
import { PasswordRecoveryCommand } from '../app/use-cases/password-recovery.use-case'
import { NewPasswordBodyInputModel } from '../utils/models/input/new-password.body.input-model'
import { NewPasswordCommand } from '../app/use-cases/new-password.use-case'
import { RegistrationBodyInputModel } from '../utils/models/input/registration.body.input-model'
import { GoogleAuthGuard } from '../../../infrastructure/guards/google-auth.guard'
import { UserDetails } from '../../../infrastructure/types/user-details.type'
import { GitHubAuthGuard } from '../../../infrastructure/guards/github-auth.guard'
import { OAuthGitHubLoginCommand } from '../app/use-cases/oAuth-github-login.use-case'
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { BadResponse, ValidResponse } from '../../../infrastructure/utils/constants'
import { OAuthGoogleLoginCommand } from '../app/use-cases/oAuth-google-login.use-case'

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
	@ApiBadRequestResponse({
		description: BadResponse.REGISTRATION
	})
	async registration(@Body() bodyRegistration: RegistrationBodyInputModel) {
		const registrationContract = await this.commandBus.execute(
			new RegistrationCommand(
				bodyRegistration.login,
				bodyRegistration.email,
				bodyRegistration.password
			)
		)
		if (registrationContract.error === ErrorMessageEnum.USER_EMAIL_EXIST)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.USER_EMAIL_EXIST, 'email')
			)
		if (registrationContract.error === ErrorMessageEnum.USER_LOGIN_EXIST)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.USER_LOGIN_EXIST, 'login')
			)
		if (registrationContract.error === ErrorMessageEnum.USER_NOT_DELETED)
			throw new ServiceUnavailableException()
		if (registrationContract.error === ErrorMessageEnum.EMAIL_NOT_SENT)
			throw new ServiceUnavailableException()
	}

	@Post('registration-confirmation')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		description: ValidResponse.REGISTRATION_CONFIRMATION,
		status: HttpStatus.NO_CONTENT
	})
	@ApiBadRequestResponse({
		description: BadResponse.REGISTRATION_CONFIRMATION
	})
	async emailConfirmation(
		@Body() bodyConfirmation: ConfirmationBodyInputModel
	) {
		const confirmationContract = await this.commandBus.execute(
			new EmailConfirmationCommand(bodyConfirmation.code)
		)

		if (confirmationContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.USER_NOT_FOUND, 'code')
			)
		if (confirmationContract.error === ErrorMessageEnum.USER_EMAIL_CONFIRMED)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.USER_EMAIL_CONFIRMED, 'code')
			)
		if (confirmationContract.error === ErrorMessageEnum.TOKEN_NOT_VERIFY)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.TOKEN_NOT_VERIFY, 'code')
			)
	}

	@Post('registration-email-resending')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	@ApiBadRequestResponse()
	async emailConfirmationResend(
		@Body() bodyConfirmationResend: EmailConfirmationResendBodyInputModel
	) {
		const confirmationResendContract = await this.commandBus.execute(
			new EmailConfirmationResendCommand(bodyConfirmationResend.email)
		)
		if (confirmationResendContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.USER_NOT_FOUND, 'email')
			)
		if (
			confirmationResendContract.error === ErrorMessageEnum.USER_EMAIL_CONFIRMED
		)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnum.USER_EMAIL_CONFIRMED, 'email')
			)
		if (confirmationResendContract.error === ErrorMessageEnum.USER_NOT_DELETED)
			throw new InternalServerErrorException()
		if (confirmationResendContract.error === ErrorMessageEnum.EMAIL_NOT_SENT)
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
		const loginContract = await this.commandBus.execute(
			new LoginCommand(bodyAuth, ip, userAgent)
		)
		if (loginContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.USER_IS_BANNED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.PASSWORD_NOT_COMPARED)
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
	async logout(@DeviceSession() deviceSession: DeviceSessionHeaderInputModel) {
		const logoutContract = await this.commandBus.execute(
			new LogoutCommand(
				deviceSession.id,
				deviceSession.exp,
				deviceSession.ip,
				deviceSession.iat,
				deviceSession.title,
				deviceSession.userId)
		)
		if (logoutContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorMessageEnum.DEVICE_NOT_FOUND)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorMessageEnum.DEVICE_NOT_DELETE)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorMessageEnum.TOKEN_NOT_VERIFY)
			throw new UnauthorizedException()
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
		const isRecoveryContract = await this.commandBus.execute(
			new PasswordRecoveryCommand(bodyPasswordRecovery.email)
		)
		if (isRecoveryContract.error === ErrorMessageEnum.EMAIL_NOT_SENT)
			throw new InternalServerErrorException()
		if (isRecoveryContract.error === ErrorMessageEnum.RECOVERY_CODE_NOT_DELETE)
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
		if (newPasswordContract.error === ErrorMessageEnum.TOKEN_NOT_VERIFY)
			throw new BadRequestException(
				outputMessageException(
					ErrorMessageEnum.TOKEN_NOT_VERIFY,
					'recoveryCode'
				)
			)
		if (newPasswordContract.error === ErrorMessageEnum.RECOVERY_CODE_NOT_FOUND)
			throw new BadRequestException(
				outputMessageException(
					ErrorMessageEnum.RECOVERY_CODE_NOT_FOUND,
					'recoveryCode'
				)
			)
		if (newPasswordContract.error === ErrorMessageEnum.RECOVERY_CODE_INVALID)
			throw new BadRequestException(
				outputMessageException(
					ErrorMessageEnum.RECOVERY_CODE_INVALID,
					'recoveryCode'
				)
			)
		if (newPasswordContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new BadRequestException(
				outputMessageException(
					ErrorMessageEnum.RECOVERY_CODE_INVALID,
					'recoveryCode'
				)
			)
	}

	@Post('status')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	user(@Req() request: Request) {
		console.log(request.user)
		return request.user
			? { msg: 'Authenticated' }
			: { msg: 'Not Authenticated' }
	}

	@Post('google/login')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(GoogleAuthGuard)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	async googleLogin() {
		return { msg: 'Google Auth' }
	}

	@Post('google/redirect')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(GoogleAuthGuard)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	async googleRedirect(
		@Req() request: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const user: Partial<UserDetails> = request.user

		const loginContract = await this.commandBus.execute(
			new OAuthGoogleLoginCommand({ email: user.email, username: user.displayName })
		)

		if (loginContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.USER_IS_BANNED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.PASSWORD_NOT_COMPARED)
			throw new UnauthorizedException()

		res.cookie('refreshToken', loginContract.data?.refreshToken, {
			httpOnly: true,
			secure: true
		})

		return loginContract.data?.accessJwt
	}


	@Post('github/login')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(GitHubAuthGuard)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	async githubLogin() {
		return { msg: 'GitHub Auth' }
	}

	@Post('some')
	@HttpCode(HttpStatus.NO_CONTENT)
	async some() {
		return { msg: 'GitHub Auth' }
	}

	@Post('github/redirect')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(GitHubAuthGuard)
	@ApiResponse({ status: HttpStatus.NO_CONTENT })
	async githubRedirect(
		@Req() request: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const user: Partial<UserDetails> = request.user

		const loginContract = await this.commandBus.execute(
			new OAuthGitHubLoginCommand(
				{ email: user.email, username: user.displayName })
		)

		if (loginContract.error === ErrorMessageEnum.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.USER_IS_BANNED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnum.PASSWORD_NOT_COMPARED)
			throw new UnauthorizedException()

		res.cookie('refreshToken', loginContract.data?.refreshToken, {
			httpOnly: true,
			secure: true
		})

		return loginContract.data?.accessJwt
	}

}
