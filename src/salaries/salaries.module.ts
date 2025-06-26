import { Module } from '@nestjs/common';
import { SalariesService } from './salaries.service';
import { SalariesController } from './salaries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SalariesController],
  providers: [SalariesService, PrismaService],
})
export class SalariesModule {}
