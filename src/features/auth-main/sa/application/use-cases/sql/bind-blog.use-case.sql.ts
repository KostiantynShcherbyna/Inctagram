import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"


export class BindBlogCommandSql {
  constructor(public id: string, public userId: string) {
  }
}

@CommandHandler(BindBlogCommandSql)
export class BindBlogSql implements ICommandHandler<BindBlogCommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async execute(command: BindBlogCommandSql): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const blog = await this.blogsRepositorySql.findBlog(command.id)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (blog.userId) return new Contract(null, ErrorEnums.BLOG_ALREADY_BOUND)

    await this.blogsRepositorySql.bindBlog({
      blogId: command.id,
      userId: command.userId
    })
    return new Contract(true, null)
  }
}