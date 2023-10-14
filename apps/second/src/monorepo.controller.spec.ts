import { Test, TestingModule } from '@nestjs/testing';
import { MonorepoController } from './monorepo.controller';
import { MonorepoService } from './monorepo.service';

describe('MonorepoController', () => {
  let monorepoController: MonorepoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MonorepoController],
      providers: [MonorepoService],
    }).compile();

    monorepoController = app.get<MonorepoController>(MonorepoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(monorepoController.getHello()).toBe('Hello World!');
    });
  });
});
