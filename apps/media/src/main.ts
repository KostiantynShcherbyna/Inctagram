import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { MediaModule } from './media.module'

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		MediaModule,
		{
			transport: Transport.TCP,
			options: {
				host: '0.0.0.0',
				port: 3051
			}
		}
	)
	await app.listen()
}

bootstrap()