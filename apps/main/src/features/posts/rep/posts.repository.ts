import { PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SortDirection } from '../../../infrastructure/utils/constants'
import { GetPostsUriInputModel } from '../utils/models/input/get-posts.uri.input-model'

@Injectable()
export class PostsQueryRepository {
	constructor(protected prismaClient: PrismaClient) {
	}

	async findPosts(queryPost: GetPostsUriInputModel, userId?: string) {

		const pageSize = Number(queryPost.pageSize) || PAGE_SIZE_DEFAULT
		const pageNumber = Number(queryPost.pageNumber) || PAGE_NUMBER_DEFAULT
		const sortBy = queryPost.sortBy || ''
		const sortDirection = queryPost.sortDirection || SortDirection.Desc
		const offset = (pageNumber - 1) * pageSize

		const totalCount = await this.prismaClient.post.count()
		const posts = await this.prismaClient.post.findMany({
			where: userId ? { userId } : undefined,
			skip: offset,
			take: pageSize,
			orderBy: { [sortBy]: sortDirection }
		})
		const pagesCount = Math.ceil(totalCount / pageSize)

		return {
			pagesCount: pagesCount,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: Number(totalCount),
			items: posts
		}
	}


}