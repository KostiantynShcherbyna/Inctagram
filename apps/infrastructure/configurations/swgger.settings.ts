import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const swaggerInitSettings = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.addCookieAuth('refreshToken')
		.setTitle('Authorization')
		.setDescription('Authorization API')
		.setVersion('1.0')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('swagger/api', app, document)
}
