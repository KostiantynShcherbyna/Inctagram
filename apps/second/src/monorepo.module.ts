import { Module } from '@nestjs/common';
import { MonorepoController } from './monorepo.controller';
import { MonorepoService } from './monorepo.service';

@Module({
  imports: [],
  controllers: [MonorepoController],
  providers: [MonorepoService],
})
export class MonorepoModule {}
