import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { PostsRepositoryOrm } from "../../../../posts/repository/typeorm/posts.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { UpdatePostBodyInputModel } from "../../../../blogger/api/models/input/update-post.body.input-model"

export class UpdatePostSACommandSql {
  constructor(
    public body: UpdatePostBodyInputModel,
    public blogId: string,
    public postId: string,
    // public userId: string,
  ) {
  }
}

@CommandHandler(UpdatePostSACommandSql)
export class UpdatePostSASql implements ICommandHandler<UpdatePostSACommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postsRepositorySql: PostsRepositoryOrm,
    protected blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async execute(command: UpdatePostSACommandSql): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    // if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const post = await this.postsRepositorySql.findPost(command.postId)
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)
    if (post.blogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_POST)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.postsRepositorySql.updatePost({
        postId: command.postId,
        title: command.body.title,
        shortDescription: command.body.shortDescription,
        content: command.body.content,
      }, queryRunner)
      await queryRunner.commitTransaction()
    } catch (e) {
      console.log("UpdatePostSql", e)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.POST_NOT_UPDATED)
    } finally {
      await queryRunner.release()
    }
    return new Contract(true, null)
  }


}