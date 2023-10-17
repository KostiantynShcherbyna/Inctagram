import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Ip,
	Post,
	Headers,
	ServiceUnavailableException,
	UseGuards,
	Res,
	UnauthorizedException
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Response } from 'express'
import { outputMessageException } from '../../../../../infrastructure/utils/output-message-exception'
import { ErrorMessageEnums } from '../../../../../infrastructure/utils/error-message-enums'
import { RegistrationBodyInputModel } from '../utils/models/input/registration.body.input-model'
import { RegistrationSqlCommand } from '../app/use-cases/registration.use-case'
import { EmailConfirmationResendBodyInputModel } from '../utils/models/input/email-confirmation-resend.body.input-model'
import { EmailConfirmationResendCommand } from '../app/use-cases/email-confirmation-resend.use-case'
import { ConfirmationBodyInputModel } from '../utils/models/input/confirmation.body.input-model'
import { EmailConfirmationCommand } from '../app/use-cases/email-confirmation.use-case'
import { LoginBodyInputModel } from '../utils/models/input/login.body.input-model'
import { LoginCommand } from '../app/use-cases/login.use-case'
import { AuthGuard } from '@nestjs/passport'
import { StrategyNames } from '../../../../../infrastructure/utils/constants'
import { RefreshGuard } from '../../../../../infrastructure/utils/guards/refresh.guard'
import { DeviceSession } from '../../../../../infrastructure/utils/decorators/device-session.decorator'
import { DeviceSessionHeaderInputModel } from '../utils/models/input/device-session.header.input-model'
import { LogoutCommand } from '../app/use-cases/logout.use-case'

@Controller('auth')
export class AuthController {
	constructor(protected commandBus: CommandBus) {}

	@Post('registration')
	@HttpCode(HttpStatus.NO_CONTENT)
	async registration(@Body() bodyRegistration: RegistrationBodyInputModel) {
		const registrationContract = await this.commandBus.execute(
			new RegistrationSqlCommand(
				bodyRegistration.login,
				bodyRegistration.email,
				bodyRegistration.password
			)
		)
		if (registrationContract.error === ErrorMessageEnums.USER_EMAIL_EXIST)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnums.USER_EMAIL_EXIST, 'email')
			)
		if (registrationContract.error === ErrorMessageEnums.USER_LOGIN_EXIST)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnums.USER_LOGIN_EXIST, 'login')
			)
		if (registrationContract.error === ErrorMessageEnums.USER_NOT_DELETED)
			throw new ServiceUnavailableException()
		if (registrationContract.error === ErrorMessageEnums.EMAIL_NOT_SENT)
			throw new ServiceUnavailableException()
	}

	@Post('registration-confirmation')
	@HttpCode(HttpStatus.NO_CONTENT)
	async confirmation(@Body() bodyConfirmation: ConfirmationBodyInputModel) {
		const confirmationContract = await this.commandBus.execute(
			new EmailConfirmationCommand(bodyConfirmation.code)
		)
		if (confirmationContract.error === ErrorMessageEnums.USER_NOT_FOUND)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnums.USER_NOT_FOUND, 'code')
			)
		if (confirmationContract.error === ErrorMessageEnums.USER_EMAIL_CONFIRMED)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnums.USER_EMAIL_CONFIRMED, 'code')
			)
		if (
			confirmationContract.error === ErrorMessageEnums.CONFIRMATION_CODE_EXPIRED
		)
			throw new BadRequestException(
				outputMessageException(
					ErrorMessageEnums.CONFIRMATION_CODE_EXPIRED,
					'code'
				)
			)
	}

	@Post('email-confirmation-resend')
	@HttpCode(HttpStatus.NO_CONTENT)
	async emailConfirmationResend(
		@Body() bodyConfirmationResend: EmailConfirmationResendBodyInputModel
	) {
		const confirmationResendContract = await this.commandBus.execute(
			new EmailConfirmationResendCommand(bodyConfirmationResend.email)
		)
		if (confirmationResendContract.error === ErrorMessageEnums.USER_NOT_FOUND)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnums.USER_NOT_FOUND, 'email')
			)
		if (
			confirmationResendContract.error ===
			ErrorMessageEnums.USER_EMAIL_CONFIRMED
		)
			throw new BadRequestException(
				outputMessageException(ErrorMessageEnums.USER_EMAIL_CONFIRMED, 'email')
			)
		if (confirmationResendContract.error === ErrorMessageEnums.USER_NOT_DELETED)
			throw new InternalServerErrorException()
		if (confirmationResendContract.error === ErrorMessageEnums.EMAIL_NOT_SENT)
			throw new InternalServerErrorException()
	}

	@Post('login')
	@UseGuards(AuthGuard(StrategyNames.loginLocalStrategy))
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
		if (loginContract.error === ErrorMessageEnums.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnums.USER_IS_BANNED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnums.USER_EMAIL_NOT_CONFIRMED)
			throw new UnauthorizedException()
		if (loginContract.error === ErrorMessageEnums.PASSWORD_NOT_COMPARED)
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
	async logout(@DeviceSession() deviceSession: DeviceSessionHeaderInputModel) {
		const logoutContract = await this.commandBus.execute(
			new LogoutCommand(
				deviceSession.deviceId,
				deviceSession.expireAt,
				deviceSession.ip,
				deviceSession.lastActiveDate,
				deviceSession.title,
				deviceSession.userId
			)
		)
		if (logoutContract.error === ErrorMessageEnums.USER_NOT_FOUND)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorMessageEnums.DEVICE_NOT_FOUND)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorMessageEnums.DEVICE_NOT_DELETE)
			throw new UnauthorizedException()
		if (logoutContract.error === ErrorMessageEnums.TOKEN_NOT_VERIFY)
			throw new UnauthorizedException()
		return
	}
}
