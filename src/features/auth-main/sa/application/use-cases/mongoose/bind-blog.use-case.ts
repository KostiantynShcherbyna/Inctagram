import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"


export class BindBlogCommand {
  constructor(public id: string, public userId: string) {
  }
}

@CommandHandler(BindBlogCommand)
export class BindBlogBlogger implements ICommandHandler<BindBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: BindBlogCommand): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const blog = await this.blogsRepository.findBlog(command.id)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (blog.blogOwnerInfo.userId) return new Contract(null, ErrorEnums.BLOG_ALREADY_BOUND)

    blog.bindBlog(command.userId)
    await this.blogsRepository.saveDocument(blog)

    return new Contract(true, null)
  }
}