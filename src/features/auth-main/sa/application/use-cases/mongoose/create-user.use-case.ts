import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Users, UsersDocument, UsersModel } from "../../entities/mongoose/users.schema"
import { UsersRepository } from "../../../repository/mongoose/users.repository"
import { CreateUserOutputModel } from "../../../api/models/output/create-user.output-model"


export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUser implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: CreateUserCommand): Promise<CreateUserOutputModel> {

    const newUser = await this.UsersModel.createUser(
      {
        login: command.login,
        email: command.email,
        password: command.password,
      },
      this.UsersModel
    )
    await this.usersRepository.saveDocument(newUser)
    const userView = this.createUserView(newUser)
    return userView
  }


  private createUserView(data: UsersDocument) {
    return {
      id: data._id.toString(),
      login: data.accountData.login,
      email: data.accountData.email,
      createdAt: data.accountData.createdAt,
      banInfo: {
        banDate: data.accountData.banInfo.banDate,
        banReason: data.accountData.banInfo.banReason,
        isBanned: data.accountData.banInfo.isBanned,
      }
    }
  }

}