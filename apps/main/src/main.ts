import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)
	const port = configService.get('PORT', 3002)
	//	swaggerInitSettings(app)

	const config = new DocumentBuilder()
		//.addCookieAuth('refreshToken')
		.setTitle('Authorization')
		.setDescription('Micro Service of Authorization API')
		.setVersion('1.0')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('swagger', app, document)

	await app.listen(port)
}

bootstrap()
