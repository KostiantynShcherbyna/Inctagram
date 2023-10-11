import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Users, UsersDocument, UsersModel } from "../../../features/sa/application/entities/mongoose/users.schema"
import { UserBodyInputModel } from "../api/models/input/user.body.input-model"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

@Injectable()
export class TestingRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Users.name) protected UsersModel: UsersModel,
  ) {
  }

  async getUser(bodyUser: UserBodyInputModel): Promise<null | UsersDocument> {


    const searchDto = {
      login: bodyUser.loginOrEmail,
      email: bodyUser.loginOrEmail
    }

    const foundUser = await this.UsersModel.findOne({
      $or: [
        { "accountData.login": searchDto.login },
        { "accountData.email": searchDto.email },
      ]
    })
    if (foundUser === null) {
      return null
    }

    return foundUser
  }

  async findUserByLoginOrEmail(userAuthData: { login: string, email: string }) {
    const foundUser = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from public."account_entity" a
    left join public."ban_info_entity" b on b."UserId" = a."UserId" 
    left join public."email_confirmation_entity" c on c."UserId" = a."UserId"
    where "Login" = $1 or "Email" = $2
    `, [userAuthData.login, userAuthData.email])
    return foundUser.length ? foundUser[0] : null
  }

}
