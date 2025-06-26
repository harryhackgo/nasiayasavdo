import { Module } from '@nestjs/common';
import { StockEntriesService } from './stock-entries.service';
import { StockEntriesController } from './stock-entries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StockEntriesController],
  providers: [StockEntriesService, PrismaService],
})
export class StockEntriesModule {}
