import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, PrismaService],
})
export class PartnersModule {}
