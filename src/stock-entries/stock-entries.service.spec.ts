import { Test, TestingModule } from '@nestjs/testing';
import { StockEntriesService } from './stock-entries.service';

describe('StockEntriesService', () => {
  let service: StockEntriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockEntriesService],
    }).compile();

    service = module.get<StockEntriesService>(StockEntriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
