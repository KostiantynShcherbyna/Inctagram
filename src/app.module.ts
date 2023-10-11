import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {AuthController} from "./auth-copy/auth/api/auth.controller.sql";

@Module({
  imports: [],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
