import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { UpdateBlogBodyInputModel } from "../../../../blogger/api/models/input/update-blog.body.input-model"


export class UpdateBlogSACommandSql {
  constructor(
    public blogId: string,
    public bodyBlog: UpdateBlogBodyInputModel,
    // public userId: string,
  ) {
  }
}


@CommandHandler(UpdateBlogSACommandSql)
export class UpdateBlogSASql implements ICommandHandler<UpdateBlogSACommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async execute(command: UpdateBlogSACommandSql): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    // if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const updateResult = await this.blogsRepositorySql.updateBlog({
      blogId: command.blogId,
      name: command.bodyBlog.name,
      description: command.bodyBlog.description,
      websiteUrl: command.bodyBlog.websiteUrl,
    })
    return new Contract(true, null)
  }
}