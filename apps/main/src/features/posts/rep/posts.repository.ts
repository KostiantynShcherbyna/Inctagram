import { PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SortDirection } from '../../../infrastructure/utils/constants'

@Injectable()
export class PostsQueryRepository {
	constructor(protected prismaClient: PrismaClient) {
	}

	async findPosts(queryPost: GetPostsQueryInputModel, userId?: string)
		: Promise<null | PostsView> {

		const pageSize = Number(queryPost.pageSize) || PAGE_SIZE_DEFAULT
		const pageNumber = Number(queryPost.pageNumber) || PAGE_NUMBER_DEFAULT
		const sortBy = queryPost.sortBy || ''
		const sortDirection = queryPost.sortDirection || SortDirection.Desc
		const offset = (pageNumber - 1) * pageSize

		const totalCount = await this.dataSource.createQueryBuilder(PostEntity, 'p')
			.getCount()

		const posts = await this.dataSource.createQueryBuilder(PostEntity, 'p')
			.select([
				`p.PostId as "postId"`,
				`p.Content as "content"`,
				`p.Title as "title"`,
				`p.ShortDescription as "shortDescription"`,
				`p.BlogId as "blogId"`,
				`p.BlogName as "blogName"`,
				`p.CreatedAt as "createdAt"`,
				`pl.Status as "myStatus"`,
				`pl.UserId as "userId"`,
				`pl.UserLogin as "userLogin"`
			])
			.addSelect(qb => this.likesCountBuilder1(qb), `likesCount`)
			.addSelect(qb => this.likesCountBuilder2(qb), `dislikesCount`)
			// .addSelect(qb => this.likesCountBuilder(qb, 'Like', "pl1"), `likesCount`)
			// .addSelect(qb => this.likesCountBuilder(qb, 'Dislike', "pl2"), `dislikesCount`)
			.addSelect(qb => this.newestLikesBuilder(qb), `newestLikes`)
			// .leftJoin(BlogEntity, "b", `b.BlogId = p.BlogId`)
			.leftJoin(PostLikeEntity, 'pl', `pl.PostId = p.PostId and pl.UserId = :userId`, { userId })
			// .where(`b.IsBanned = :isBanned`, { isBanned: false })
			.orderBy(`p.${sortBy}`, sortDirection)
			.limit(pageSize)
			.offset(offset)
			.getRawMany()

		const mappedPosts = this.changePostsView(posts)
		const pagesCount = Math.ceil(totalCount / pageSize)

		const postsView = {
			pagesCount: pagesCount,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: Number(totalCount),
			items: mappedPosts
		}

		return postsView
	}


}