import { Injectable } from '@nestjs/common';
import { PrismaClient } from "prisma/prisma-client/scripts/default-index";

@Injectable()
export class AppService {
  getHello(): string {
    const prisma = new PrismaClient()
    return 'Hello World!';
  }
}
