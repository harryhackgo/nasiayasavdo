import { Module } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { DebtsController } from './debts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DebtsController],
  providers: [DebtsService, PrismaService],
})
export class DebtsModule {}
