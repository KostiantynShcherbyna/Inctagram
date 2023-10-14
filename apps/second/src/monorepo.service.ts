import { Injectable } from '@nestjs/common';

@Injectable()
export class MonorepoService {
  getHello(): string {
    return 'Hello World!';
  }
}
