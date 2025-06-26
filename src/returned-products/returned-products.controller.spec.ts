import { Test, TestingModule } from '@nestjs/testing';
import { ReturnedProductsController } from './returned-products.controller';
import { ReturnedProductsService } from './returned-products.service';

describe('ReturnedProductsController', () => {
  let controller: ReturnedProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnedProductsController],
      providers: [ReturnedProductsService],
    }).compile();

    controller = module.get<ReturnedProductsController>(ReturnedProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
