import { Controller, Get } from '@nestjs/common';
import { MonorepoService } from './monorepo.service';

@Controller()
export class MonorepoController {
  constructor(private readonly monorepoService: MonorepoService) {}

  @Get()
  getHello(): string {
    return this.monorepoService.getHello();
  }
}
