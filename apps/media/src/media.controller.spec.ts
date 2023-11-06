import { Test, TestingModule } from '@nestjs/testing'
import { MediaController } from './features/api/media.controller'

describe('MediaController', () => {
	let mediaController: MediaController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [MediaController],
			providers: []
		}).compile()

		mediaController = app.get<MediaController>(MediaController)
	})

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(mediaController).toBeDefined()
		})
	})
})
