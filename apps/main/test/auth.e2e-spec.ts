import { Test, TestingModule } from '@nestjs/testing'
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { EmailAdapterMock } from './infrastructure/email-adapter.mock'
import { EmailAdapter } from '../src/infrastructure/adapters/email.adapter'
import { PublicTestingHelper } from './infrastructure/public-testing.helper'
import { UsersRepository } from '../src/features/users/repo/users.repository'
import { appSettings } from '../src/infrastructure/settings/app.settings'
import { faker } from '@faker-js/faker'
import { endpoints } from './infrastructure/routing.helper'
import { RegistrationBodyInputModel } from '../src/features/auth/utils/models/input/registration.body.input-model'
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../src/infrastructure/utils/constants'

describe
('Auth', () => {
	const second = 1000
	const minute = 60 * second

	jest.setTimeout(5 * minute)

	let app: INestApplication
	let server: HttpServer
	let publicHelper: PublicTestingHelper

	let userRepository: UsersRepository

	beforeAll
	(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		})
			.overrideProvider(EmailAdapter)
			.useClass(EmailAdapterMock)
			.compile()

		app = await moduleFixture.createNestApplication()
		app = appSettings(app)
		await app.init()
		server = app.getHttpServer()

		publicHelper = new PublicTestingHelper(server)
		userRepository = app.get(UsersRepository)

		await request(server).delete(`/api/testing/all-data`)
	})

	afterAll
	(async () => {
		await request(server).delete(`/api/testing/all-data`)
		await app.close()
	})


	describe(`AUTH`, () => {

		let inputDataUser_0: RegistrationBodyInputModel
		it(`+ registration user_0`, async () => {
			inputDataUser_0 = {
				login: faker.lorem.word({
					length: { min: LOGIN_MIN_LENGTH, max: LOGIN_MAX_LENGTH }
				}),
				email: faker.internet.email(),
				password: faker.internet.password()
			}
			const response = await request(server)
				.post(endpoints.authController.registration())
				.send(inputDataUser_0)

			expect(response.status).toEqual(HttpStatus.NO_CONTENT)
		})


		it(`+ registration-confirmation-resend`, async () => {
			const user_0 = await userRepository.findUserByEmail(inputDataUser_0.email)
			expect(user_0).not.toBeNull()
			expect(user_0?.isConfirmed).toEqual(false)

			const response = await request(server)
				.post(endpoints.authController.registrationConfirmationResend())
				.send({ email: user_0.email })

			expect(response.status).toEqual(HttpStatus.NO_CONTENT)
		})


		it(`+ registration-confirmation`, async () => {
			const user_0 = await userRepository.findUserByEmail(inputDataUser_0.email)
			const response = await request(server)
				.post(endpoints.authController.registrationConfirmation())
				.send({
					code: user_0.confirmationCodes[user_0.confirmationCodes.length - 1]
				})

			expect(response.status).toEqual(HttpStatus.NO_CONTENT)
		})


	})

})