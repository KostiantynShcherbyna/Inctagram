import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './modules/users/api/users.controller'

describe('MediaController', () => {
	let mediaController: UsersController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: []
		}).compile()

		mediaController = app.get<UsersController>(UsersController)
	})

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(mediaController).toBeDefined()
		})
	})
})
