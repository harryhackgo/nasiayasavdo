import { Test, TestingModule } from '@nestjs/testing';
import { ReturnedProductsService } from './returned-products.service';

describe('ReturnedProductsService', () => {
  let service: ReturnedProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnedProductsService],
    }).compile();

    service = module.get<ReturnedProductsService>(ReturnedProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
