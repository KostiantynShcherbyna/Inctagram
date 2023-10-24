import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { appSettings } from './infrastructure/settings/app.settings'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	appSettings(app)
	const configService = app.get(ConfigService)
	const port = configService.get('PORT', 3002)
	await app.listen(port)
}

bootstrap()
