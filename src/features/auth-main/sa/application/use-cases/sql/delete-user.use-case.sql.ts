import { CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Users, UsersModel } from "../../entities/mongoose/users.schema"
import { UsersRepository } from "../../../repository/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../repository/typeorm/users.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { PostsRepositoryOrm } from "../../../../posts/repository/typeorm/posts.repository.orm"


export class DeleteUserCommandSql {
  constructor(
    public id: string
  ) {
  }
}

@CommandHandler(DeleteUserCommandSql)
export class DeleteUserSql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersRepositorySql: UsersRepositoryOrm,
  ) {
  }

  async execute(command: DeleteUserCommandSql): Promise<Contract<null | boolean>> {

    // const deleteUserResult = await this.UsersModel.deleteOne({ _id: new Types.ObjectId(command.id) })

    const user = await this.usersRepositorySql.findUserByUserId(command.id)
    if(!user) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.usersRepositorySql.deleteEmailConfirmation(command.id, queryRunner)
      await this.usersRepositorySql.deleteBanInfo(command.id, queryRunner)
      await this.usersRepositorySql.deleteSentConfirmationCodeDates(command.id, queryRunner)
      await this.usersRepositorySql.deleteDevices(command.id, queryRunner)
      await this.usersRepositorySql.deleteAccountData(command.id, queryRunner)
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log("DeleteUserSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.USER_NOT_DELETED)
    } finally {
      await queryRunner.release()
    }
    return new Contract(true, null)
  }

}