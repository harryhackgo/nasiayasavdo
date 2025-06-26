import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, PrismaService, PartnersService],
})
export class SalesModule {}
