import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { Response } from "express"
import { LoginBodyInputModel } from "./models/input/login.body.input-model"
import { BodyConfirmationResendInputModel } from "./models/input/registration-resend.body.input-model"
import { PasswordRecoveryBodyInputModel } from "./models/input/password-recovery.body.input-model"
import { NewPasswordBodyInputModel } from "./models/input/new-password.body.input-model"
import { DeviceSessionReqInputModel } from "./models/input/device-session.req.input-model"
import { RegistrationBodyInputModel } from "./models/input/registration.body.input-model"
import { LoginSqlCommandCopy } from "../application/use-cases/sql/login.sql.use-case"
import { LogoutSqlCommandCopy } from "../application/use-cases/sql/logout.sql.use-case"
import { RefreshTokenSqlCommandCopy } from "../application/use-cases/sql/refresh-token.sql.use-case"
import { RegistrationSqlCommandCopy } from "../application/use-cases/sql/registration.sql.use-case"
import { ConfirmationSqlCommandCopy } from "../application/use-cases/sql/confirmation.sql.use-case"
import { ConfirmationResendSqlCommandCopy } from "../application/use-cases/sql/confirmation-resend.sql.use-case"
import { PasswordRecoverySqlCommandCopy } from "../application/use-cases/sql/password-recovery.sql.use-case"
import { NewPasswordSqlCommandCopy } from "../application/use-cases/sql/new-password.sql.use-case"
import { ConfirmationBodyInputModelSql } from "./models/input/confirmation.body.input-model.sql"
import { UsersQueryRepositoryOrm } from "src/features/auth-main/sa/repository/typeorm/users.query.repository.orm"
import { ErrorEnums } from "src/features/auth-main/infrastructure/utils/error-enums"
import { StrategyNames, USER_AGENT } from "src/features/auth-main/infrastructure/utils/constants"
import { CommandBus } from "@nestjs/cqrs"
import { AuthGuard } from "@nestjs/passport"
import { RefreshGuard } from "src/features/auth-main/infrastructure/guards/refresh.guard"
import { DeviceSession } from "src/features/auth-main/infrastructure/decorators/device-session.decorator"
import { callErrorMessage } from "src/features/auth-main/infrastructure/adapters/exception-message.adapter"
import { AccessGuard } from "src/features/auth-main/infrastructure/guards/access.guard"

@Controller("auth")
export class AuthController {
  constructor(
    protected usersQueryRepositorySql: UsersQueryRepositoryOrm,
    protected commandBus: CommandBus
  ) {
  }

  @Post("login")
  // @Throttle(5, 10)
  @UseGuards(AuthGuard(StrategyNames.loginSqlLocalStrategy))
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers("user-agent") userAgent: string = USER_AGENT,
    @Ip() ip: string,
    @Body() bodyAuth: LoginBodyInputModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginContract = await this.commandBus.execute(
      new LoginSqlCommandCopy(bodyAuth, ip, userAgent)
    )
    if (loginContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.USER_IS_BANNED) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.PASSWORD_NOT_COMPARED) throw new UnauthorizedException()

    res.cookie("refreshToken", loginContract.data?.refreshToken, { httpOnly: true, secure: true })
    return loginContract.data?.accessJwt
  }


  @UseGuards(RefreshGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel
  ) {
    const logoutContract = await this.commandBus.execute(
      new LogoutSqlCommandCopy(
        deviceSession.deviceId,
        deviceSession.expireAt,
        deviceSession.ip,
        deviceSession.lastActiveDate,
        deviceSession.title,
        deviceSession.userId
      )
    )

    if (logoutContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (logoutContract.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (logoutContract.error === ErrorEnums.DEVICE_NOT_DELETE) throw new UnauthorizedException()
    if (logoutContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new UnauthorizedException()
    return
  }


  @UseGuards(RefreshGuard)
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Headers("user-agent") userAgent: string = USER_AGENT,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenContract = await this.commandBus.execute(
      new RefreshTokenSqlCommandCopy(
        deviceSession,
        ip,
        userAgent
      )
    )

    if (refreshTokenContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (refreshTokenContract.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (refreshTokenContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new UnauthorizedException()

    res.cookie("refreshToken", refreshTokenContract.data?.refreshToken, { httpOnly: true, secure: true })
    return refreshTokenContract.data?.accessJwt
  }


  @Post("registration")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() bodyRegistration: RegistrationBodyInputModel
  ) {
    const registrationContract = await this.commandBus.execute(
      new RegistrationSqlCommandCopy(
        bodyRegistration.login,
        bodyRegistration.email,
        bodyRegistration.password
      )
    )

    if (registrationContract.error === ErrorEnums.USER_EMAIL_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_EXIST, "email")
    )
    if (registrationContract.error === ErrorEnums.USER_LOGIN_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_LOGIN_EXIST, "login")
    )
    if (registrationContract.error === ErrorEnums.USER_NOT_DELETED) throw new InternalServerErrorException() // TODO как обрабатывать логику неотправки емейла ?
    if (registrationContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException() // TODO как обрабатывать логику неотправки емейла ?
    return
  }


  @Post("registration-confirmation")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(
    @Body() bodyConfirmation: ConfirmationBodyInputModelSql
  ) {
    const confirmationContract = await this.commandBus.execute(
      new ConfirmationSqlCommandCopy(bodyConfirmation.code)
    )

    if (confirmationContract.error === ErrorEnums.USER_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "code")
    )
    if (confirmationContract.error === ErrorEnums.USER_EMAIL_CONFIRMED) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_CONFIRMED, "code")
    )
    if (confirmationContract.error === ErrorEnums.CONFIRMATION_CODE_EXPIRED) throw new BadRequestException(
      callErrorMessage(ErrorEnums.CONFIRMATION_CODE_EXPIRED, "code")
    )
    return
  }


  @Post("registration-email-resending")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationResend(
    @Body() bodyConfirmationResend: BodyConfirmationResendInputModel
  ) {
    const confirmationResendContract = await this.commandBus.execute(
      new ConfirmationResendSqlCommandCopy(bodyConfirmationResend.email)
    )

    if (confirmationResendContract.error === ErrorEnums.USER_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "email")
    )
    if (confirmationResendContract.error === ErrorEnums.USER_EMAIL_CONFIRMED) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_CONFIRMED, "email")
    )
    if (confirmationResendContract.error === ErrorEnums.USER_NOT_DELETED) throw new InternalServerErrorException()
    if (confirmationResendContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException()
    return
  }


  @UseGuards(AccessGuard)
  @Get("me")
  async getMe(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const userView = await this.usersQueryRepositorySql.findMe(deviceSession.userId)
    if (userView === null) throw new UnauthorizedException()
    return userView
  }


  @Post("password-recovery")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() bodyPasswordRecovery: PasswordRecoveryBodyInputModel
  ) {
    const isRecoveryContract = await this.commandBus.execute(
      new PasswordRecoverySqlCommandCopy(bodyPasswordRecovery.email)
    )
    if (isRecoveryContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException()
    if (isRecoveryContract.error === ErrorEnums.RECOVERY_CODE_NOT_DELETE) throw new InternalServerErrorException()
    return
  }


  @Post("new-password")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() bodyNewPassword: NewPasswordBodyInputModel
  ) {
    const newPasswordContract = await this.commandBus.execute(
      new NewPasswordSqlCommandCopy(
        bodyNewPassword.newPassword,
        bodyNewPassword.recoveryCode
      )
    )

    if (newPasswordContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new BadRequestException(
      callErrorMessage(ErrorEnums.TOKEN_NOT_VERIFY, "recoveryCode")
    )
    if (newPasswordContract.error === ErrorEnums.RECOVERY_CODE_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.RECOVERY_CODE_NOT_FOUND, "recoveryCode")
    )
    if (newPasswordContract.error === ErrorEnums.RECOVERY_CODE_INVALID) throw new BadRequestException(
      callErrorMessage(ErrorEnums.RECOVERY_CODE_INVALID, "recoveryCode")
    )
    if (newPasswordContract.error === ErrorEnums.USER_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.RECOVERY_CODE_INVALID, "recoveryCode")
    )
    return
  }
}
