import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/db/prisma/prisma.service';

@Controller()
export class UsersController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('users')
  async getAllUsers(): Promise<unknown[]> {
    return this.prismaService.user.findMany();
  }

  @Get('user/:id/drafts')
  async getDraftsByUser(@Param('id') id: string): Promise<unknown[]> {
    return this.prismaService.user
      .findUnique({
        where: { id: Number(id) },
      })
      .posts({
        where: {
          published: false,
        },
      });
  }
}
