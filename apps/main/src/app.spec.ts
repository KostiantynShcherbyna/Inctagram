import { Test, TestingModule } from '@nestjs/testing'
import { HttpServer, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './app.module'
import { appSettings } from './infrastructure/configurations/app.settings'

describe('AppController-unit', () => {
	let app: INestApplication
	let server: HttpServer


	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile()

		app = await moduleFixture.createNestApplication()
		app = appSettings(app)
		await app.init()
		server = app.getHttpServer()
	})

	it('/testing/all-data', () => {
		return request(server)
			.get(`/api/`)
			.expect(404)
	})
})
