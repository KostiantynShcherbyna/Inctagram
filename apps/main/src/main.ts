import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import * as session from 'express-session'
import passport from 'passport'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)
	const port = configService.get('PORT', 3002)
	app.setGlobalPrefix('api')
	app.use(
		session({
			secret: 'dhwye08u4w90ri0w94ur09wi3-0',
			saveUninitialized: false,
			resave: false,
			cookie: {
				maxAge: 60000
			}
		})
	)
	app.use(passport.initialize())
	app.use(passport.session())
	await app.listen(port)
}

bootstrap()
