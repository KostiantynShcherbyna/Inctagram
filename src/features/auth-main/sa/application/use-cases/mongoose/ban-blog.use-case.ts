import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Blogs, BlogsModel } from "../../../../blogs/application/entities/mongoose/blogs.schema"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Contract } from "../../../../../infrastructure/utils/contract"


export class BanBlogCommand {
  constructor(
    public blogId: string,
    public isBanned: boolean,
  ) {
  }
}

@CommandHandler(BanBlogCommand)
export class BanBlog implements ICommandHandler<BanBlogCommand> {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: BanBlogCommand) {

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.banInfo.isBanned === command.isBanned)
      return new Contract(true, null)


    command.isBanned === true
      ? foundBlog.banBlog()
      : foundBlog.unbanBlog()

    await this.blogsRepository.saveDocument(foundBlog)

    return new Contract(true, null)
  }
}