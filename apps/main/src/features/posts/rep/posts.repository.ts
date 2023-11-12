import { PostImage, PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PAGE_SIZE_DEFAULT, SortDirection } from '../../../infrastructure/utils/constants'
import { GetPostsUriInputModel } from '../utils/models/input/get-posts.uri.input-model'

interface IPostNPostImage {
	id: string
	description: string
	createdAt: Date
	updatedAt: Date
	userId: string
	postImages: PostImage[]
}

@Injectable()
export class PostsQueryRepository {
	constructor(protected prismaClient: PrismaClient) {
	}

	async findPosts(queryPost: GetPostsUriInputModel, userId?: string) {

		const count = Number(queryPost.pageSize) || PAGE_SIZE_DEFAULT
		const sortBy = queryPost.sortBy || ''
		const sortDirection = queryPost.sortDirection || SortDirection.Desc

		const totalCount = await this.prismaClient.post.count()
		const postsNPostImages = await this.prismaClient.post.findMany({
			include: { postImages: true },
			where: { userId: userId },
			take: count,
			skip: 1,
			cursor: queryPost.cursor ? { id: queryPost.cursor } : undefined,
			orderBy: { [sortBy]: sortDirection }
		})

		const cursor = postsNPostImages[count - 1].id

		const outputView = this.mapPostsNPostImages(postsNPostImages)

		return {
			pageSize: count,
			totalCount: Number(totalCount),
			items: outputView,
			cursor: cursor
		}
	}

	private mapPostsNPostImages(data: IPostNPostImage[]) {
		return data.map(i => (
			{
				id: i.id,
				description: i.description,
				images: i.postImages.map(j => ({
					url: j.url,
					width: j.width,
					height: j.height,
					fileSize: j.size,
					uploadId: j.id
				})),
				createdAt: i.createdAt,
				updatedAt: i.updatedAt,
				ownerId: i.userId
			}
		))
	}


}