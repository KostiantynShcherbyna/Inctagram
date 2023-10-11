import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { StrategyNames } from "../utils/constants"
import { ErrorEnums } from "../utils/error-enums"
import {UsersRepositoryOrm} from "../../sa/repository/typeorm/users.repository.orm";


@Injectable()
export class LoginLocalStrategy extends PassportStrategy(Strategy, StrategyNames.loginLocalStrategy) {
  constructor(
    protected usersRepository: UsersRepositoryOrm,
  ) {
    super({ usernameField: "loginOrEmail" })
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersRepository.findUserByLoginOrEmail({
      login: loginOrEmail,
      email: loginOrEmail
    })
    if (user === null) throw new UnauthorizedException(
      // callErrorMessage(ErrorEnums.USER_NOT_FOUND, "loginOrEmail")
    )


    const checkConfirmationAndHashContract = await user.checkConfirmationAndHash(
      user.accountData.passwordHash,
      password
    )
    if (checkConfirmationAndHashContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
      throw new UnauthorizedException()
    if (checkConfirmationAndHashContract.error === ErrorEnums.PASSWORD_NOT_COMPARED)
      throw new UnauthorizedException()

    return user
  }

}