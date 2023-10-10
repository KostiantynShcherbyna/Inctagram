import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/db/prisma/prisma.service";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  prismaService.prisma.$connect();
  await app.listen(3000);
}

bootstrap();
