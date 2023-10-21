import { Test, TestingModule } from '@nestjs/testing'
import { PostController } from './features/posts/api/post.controller'
import { PostService } from './features/posts/app/post.service'
import { PrismaService } from './prisma.service'

describe('PostController', () => {
	let postController: PostController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [PostController],
			providers: [PostService, PrismaService]
		}).compile()

		postController = app.get<PostController>(PostController)
	})

	describe('root', () => {
		it('should return "Hello World!"', async () => {
			expect(await postController.getPublishedPosts()).toBeDefined()
		})
	})
})
