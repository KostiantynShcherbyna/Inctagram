import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"


export class BanBlogCommandSql {
  constructor(
    public blogId: string,
    public isBanned: boolean,
  ) {
  }
}

@CommandHandler(BanBlogCommandSql)
export class BanBlogSql implements ICommandHandler<BanBlogCommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async execute(command: BanBlogCommandSql) {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.isBanned === command.isBanned)
      return new Contract(true, null)

    await this.blogsRepositorySql.setBanBlogBySA({
      blogId: command.blogId,
      isBanned: command.isBanned,
      banDate: new Date(Date.now()).toISOString()
    })

    return new Contract(true, null)
  }
}