import { Module } from '@nestjs/common';
import { ReturnedProductsService } from './returned-products.service';
import { ReturnedProductsController } from './returned-products.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ReturnedProductsController],
  providers: [ReturnedProductsService, PrismaService],
})
export class ReturnedProductsModule {}
