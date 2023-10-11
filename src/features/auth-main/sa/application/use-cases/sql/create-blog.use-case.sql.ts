import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"

export class CreateBlogSACommandSql {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string
  ) {
  }
}


@CommandHandler(CreateBlogSACommandSql)
export class CreateBlogSASql implements ICommandHandler<CreateBlogSACommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
  ) {
  }

  //  : Promise<Contract<null | string>>
  async execute(command: CreateBlogSACommandSql) {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const newBlogId = await this.blogsRepositorySql.createBlogSA({
      name: command.name,
      description: command.description,
      websiteUrl: command.websiteUrl
    })
    return new Contract(newBlogId, null)
  }

}