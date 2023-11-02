import { INestApplication, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { ErrorExceptionFilter, HttpExceptionFilter } from '../utils/exeption-filter'
import { AppModule } from '../../app.module'
import { errorMessagesAdapter } from '../adapters/error-messages.adapter'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebase.settings'

export const appSettings = (app: INestApplication) => {
	app.use(cookieParser())
	app.enableCors({
		origin: ['http://localhost:3000', 'http://localhost:3000/api', 'https://visualvoyage.ru/', 'https://visualvoyage.ru/api']
	})
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
	app.setGlobalPrefix('api')
	app.use(
		session({
			secret: 'dhwye08u4w90ri0w94ur09wi3-0',
			saveUninitialized: false,
			resave: false,
			cookie: { maxAge: 60000 }
		})
	)
	app.use(passport.initialize())
	app.use(passport.session())
	initializeApp(firebaseConfig)
	useContainer(app.select(AppModule), { fallbackOnErrors: true })
	return app
}