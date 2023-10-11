import {Injectable, UnauthorizedException} from "@nestjs/common"
import {PassportStrategy} from "@nestjs/passport"
import {Strategy} from "passport-local"
import {StrategyNames} from "../utils/constants"
import {compareHashManager} from "../services/compare-hash.service"
import {UsersRepositoryOrm} from "../../sa/repository/typeorm/users.repository.orm";


@Injectable()
export class LoginLocalStrategySql extends PassportStrategy(Strategy, StrategyNames.loginSqlLocalStrategy) {
  constructor(
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
    super({ usernameField: "loginOrEmail" })
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersSqlRepository.findUserByLoginOrEmail({
      login: loginOrEmail,
      email: loginOrEmail
    })
    if (user === null) throw new UnauthorizedException()
    if (user.isConfirmed === false) throw new UnauthorizedException()
    if (await compareHashManager(user.passwordHash, password) === false) throw new UnauthorizedException()

    return user
  }

}