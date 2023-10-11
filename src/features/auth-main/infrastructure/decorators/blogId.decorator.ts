import { Injectable, } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from "../../features/blogs/repository/mongoose/blogs.repository"


@ValidatorConstraint({ name: 'BlogIdIsExist', async: true })
@Injectable()
export class BlogIdIsExist implements ValidatorConstraintInterface {
  constructor(
    private readonly blogsRepository: BlogsRepository,
  ) {
  }

  async validate(blogId: string) {
    const foundBlog = await this.blogsRepository.findBlog(blogId)
    if (foundBlog === null) return false
    return true
  }
  defaultMessage(): string {
    return "Blog not found"
  }
}