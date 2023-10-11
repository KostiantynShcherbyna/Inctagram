import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { PostsRepositoryOrm } from "../../../../posts/repository/typeorm/posts.repository.orm"

export class CreatePostSACommandSql {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    // public userId: string
  ) {
  }
}

@CommandHandler(CreatePostSACommandSql)
export class CreatePostSASql implements ICommandHandler<CreatePostSACommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected postsRepositorySql: PostsRepositoryOrm,
  ) {
  }

  async execute(command: CreatePostSACommandSql): Promise<Contract<null | string>> {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    // if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const newPostId = await this.postsRepositorySql.createPost(
      {
        title: command.title,
        shortDescription: command.shortDescription,
        content: command.content,
        blogName: foundBlog.name,
        blogId: command.blogId,
      }
    )
    return new Contract(newPostId, null)
  }
}