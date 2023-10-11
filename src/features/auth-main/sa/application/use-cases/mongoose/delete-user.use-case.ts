import { CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Users, UsersModel } from "../../entities/mongoose/users.schema"
import { UsersRepository } from "../../../repository/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"


export class DeleteUserCommand {
  constructor(
    public id: string
  ) {
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUser {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: DeleteUserCommand): Promise<Contract<null | boolean>> {

    // const deleteUserResult = await this.UsersModel.deleteOne({ _id: new Types.ObjectId(command.id) })

    const deleteUserContract = await Users.deleteUser(
      command.id,
      this.UsersModel,
    )
    if (deleteUserContract.data === 0)
      return new Contract(null, ErrorEnums.USER_NOT_DELETED)

    return new Contract(true, null)
  }

}