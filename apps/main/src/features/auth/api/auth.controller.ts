import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
	ServiceUnavailableException
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { outputMessageException } from '../../../../../infrastructure/utils/output-message-exception'
import { ErrorMessageEnums } from '../../../../../infrastructure/utils/error-message-enums'
import { RegistrationBodyInputModel } from '../utils/models/registration.body.input-model'
import { RegistrationSqlCommand } from '../app/use-cases/registration.use-case'
import { EmailConfirmationResendBodyInputModel } from '../utils/models/email-confirmation-resend.body.input-model'
import {
	EmailConfirmationResendCommand,
	EmailConfirmationResendUseCase
} from '../app/use-cases/email-confirmation-resend.use-case'

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
		return
	}
}
