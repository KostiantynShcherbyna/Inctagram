import { Injectable, } from "@nestjs/common"
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator"
import { BlogsRepository } from "../../features/blogs/repository/mongoose/blogs.repository"
import { BlogsRepositoryOrm } from "../../features/blogs/repository/typeorm/blogs.repository.orm"


@ValidatorConstraint({ name: "BlogIdIsExistSql", async: true })
@Injectable()
export class BlogIdIsExistSql implements ValidatorConstraintInterface {
  constructor(
    protected readonly blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async validate(blogId: string) {
    const foundBLog = await this.blogsRepositorySql.findBlog(blogId)
    return !!foundBLog
  }

  defaultMessage(): string {
    return "Blog not found"
  }
}