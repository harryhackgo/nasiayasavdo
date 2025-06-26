import { Test, TestingModule } from '@nestjs/testing';
import { StockEntriesController } from './stock-entries.controller';
import { StockEntriesService } from './stock-entries.service';

describe('StockEntriesController', () => {
  let controller: StockEntriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockEntriesController],
      providers: [StockEntriesService],
    }).compile();

    controller = module.get<StockEntriesController>(StockEntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
