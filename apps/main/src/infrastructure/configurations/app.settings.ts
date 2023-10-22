import { INestApplication, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { ErrorExceptionFilter, HttpExceptionFilter } from '../utils/exeption-filter'
import { AppModule } from '../../app.module'
import { errorMessagesAdapter } from '../adapters/error-messages.adapter'
import * as cookieParser from 'cookie-parser'

export const appSettings = (app: INestApplication) => {
	app.use(cookieParser())
	app.enableCors()
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			stopAtFirstError: true,
			exceptionFactory: errorMessagesAdapter
		})
	)
	app.useGlobalFilters(
		new ErrorExceptionFilter(),
		new HttpExceptionFilter()
	)
	useContainer(app.select(AppModule), { fallbackOnErrors: true })
	return app
}