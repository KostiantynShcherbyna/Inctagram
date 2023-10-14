import { NestFactory } from '@nestjs/core';
import { MonorepoModule } from './monorepo.module';

async function bootstrap() {
  const app = await NestFactory.create(MonorepoModule);
  await app.listen(3000);
}
bootstrap();
