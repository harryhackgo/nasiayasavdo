import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { Prisma, Debt } from '@prisma/client';

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateDebtDto): Promise<Debt> {
    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id: createDto.saleId },
      });

      if (!sale) throw new BadRequestException("Sale doesn't exist");

      return await this.prisma.debt.create({
        data: createDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating debt: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DebtWhereUniqueInput;
    where?: Prisma.DebtWhereInput;
    orderBy?: Prisma.DebtOrderByWithRelationInput;
  }): Promise<Debt[]> {
    try {
      return await this.prisma.debt.findMany({
        ...params,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching debts: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Debt> {
    try {
      const debt = await this.prisma.debt.findUnique({
        where: { id },
      });

      if (!debt) throw new NotFoundException('Debt not found');
      return debt;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching debt: ' + error.message,
      );
    }
  }

  async update(id: string, updateDto: UpdateDebtDto): Promise<Debt> {
    try {
      const existing = await this.prisma.debt.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Debt not found');

      if (updateDto.saleId) {
        const saleExists = await this.prisma.sale.findUnique({
          where: { id: updateDto.saleId },
        });
        if (!saleExists)
          throw new BadRequestException("Sale with this ID doesn't exist");
      }

      return await this.prisma.debt.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating debt: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<Debt> {
    try {
      const existing = await this.prisma.debt.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Debt not found');
      return await this.prisma.debt.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting debt: ' + error.message,
      );
    }
  }
}
