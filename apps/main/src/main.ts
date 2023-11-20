import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { appSettings } from './infrastructure/settings/app.settings'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	appSettings(app)
	const configService = app.get(ConfigService)
	const port = configService.get<number>('PORT', 3002)

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Inctagram Api')
		.addTag("Auth")
		.build()
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
	SwaggerModule.setup('/swagger', app, swaggerDocument)

	await app.listen(port)
}

bootstrap()
