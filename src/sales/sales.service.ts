import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Prisma, Sale } from '@prisma/client';
import { PartnersService } from '../partners/partners.service';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partnersService: PartnersService,
  ) {}

  async create(createDto: CreateSaleDto): Promise<Sale> {
    try {
      const [partner, user, product, stockEntry] = await Promise.all([
        this.prisma.partner.findUnique({ where: { id: createDto.partnerId } }),
        this.prisma.user.findUnique({ where: { id: createDto.userId } }),
        this.prisma.product.findUnique({ where: { id: createDto.productId } }),
        this.prisma.stockEntry.findUnique({
          where: { id: createDto.stockEntryId },
        }),
      ]);

      if (!partner) throw new BadRequestException("Partner doesn't exist");
      if (partner.role != 'CUSTOMER')
        throw new BadRequestException('Role of the partner should be CUSTOMER');
      if (!user) throw new BadRequestException("User doesn't exist");
      if (!product) throw new BadRequestException("Product doesn't exist");
      if (createDto.stockEntryId && !stockEntry)
        throw new BadRequestException("Stock entry doesn't exist");
      if (product.quantity < createDto.quantity)
        throw new BadRequestException('There are not that much products');
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 30);
      const total_debt = createDto.sell_price * createDto.quantity;

      const [sale] = await this.prisma.$transaction([
        this.prisma.sale.create({
          data: {
            ...createDto,
            time:
              createDto.time ??
              (
                await this.prisma.category.findUnique({
                  where: { id: product.categoryId },
                })
              )?.time,
          },
        }),
        this.prisma.product.update({
          where: { id: createDto.productId },
          data: { quantity: { decrement: createDto.quantity } },
        }),
      ]);

      await this.prisma.debt.create({
        data: {
          total_debt,
          time: createDto.time,
          saleId: sale.id,
          paid_amount: 0,
          status: 'OPEN',
          next_due_date: nextDueDate,
        },
      });

      await this.partnersService.update(partner.id, {
        balance: partner.balance.toNumber() - total_debt,
      });

      const fullSale = await this.prisma.sale.findUnique({
        where: { id: sale.id },
      });

      if (!fullSale) {
        throw new InternalServerErrorException(
          'Sale was just created but not found',
        );
      }

      return fullSale;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating sale: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SaleWhereUniqueInput;
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput;
  }): Promise<Sale[]> {
    try {
      return await this.prisma.sale.findMany({
        ...params,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching sales: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Sale> {
    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id },
      });

      if (!sale) throw new NotFoundException('Sale not found');
      return sale;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching sale: ' + error.message,
      );
    }
  }

  async update(id: string, updateDto: UpdateSaleDto): Promise<Sale> {
    try {
      const exists = await this.prisma.sale.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Sale not found');

      const checks = await Promise.all([
        updateDto.partnerId
          ? this.prisma.partner.findUnique({
              where: { id: updateDto.partnerId },
            })
          : null,
        updateDto.userId
          ? this.prisma.user.findUnique({ where: { id: updateDto.userId } })
          : null,
        updateDto.productId
          ? this.prisma.product.findUnique({
              where: { id: updateDto.productId },
            })
          : null,
        updateDto.stockEntryId
          ? this.prisma.stockEntry.findUnique({
              where: { id: updateDto.stockEntryId },
            })
          : null,
      ]);

      if (updateDto.partnerId && !checks[0])
        throw new BadRequestException("Partner doesn't exist");
      if (updateDto.partnerId && checks[0]?.role != 'CUSTOMER')
        throw new BadRequestException('Role of the partner should be CUSTOMER');
      if (updateDto.userId && !checks[1])
        throw new BadRequestException("User doesn't exist");
      if (updateDto.productId && !checks[2])
        throw new BadRequestException("Product doesn't exist");
      if (updateDto.stockEntryId && !checks[3])
        throw new BadRequestException("Stock entry doesn't exist");

      if (updateDto.quantity) {
        if (updateDto.productId)
          await this.prisma.$transaction([
            this.prisma.product.update({
              where: { id: exists.productId },
              data: { quantity: { increment: exists.quantity } },
            }),
            this.prisma.product.update({
              where: { id: updateDto.productId },
              data: { quantity: { decrement: updateDto.quantity } },
            }),
          ]);
        else
          await this.prisma.product.update({
            where: { id: exists.productId },
            data: { quantity: exists.quantity - updateDto.quantity },
          });
      }

      return await this.prisma.sale.update({
        where: { id },
        data: updateDto,
        include: {
          partner: true,
          user: true,
          product: true,
          stockEntry: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating sale: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<Sale> {
    try {
      const exists = await this.prisma.sale.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Sale not found');

      return await this.prisma.sale.delete({
        where: { id },
        include: {
          partner: true,
          user: true,
          product: true,
          stockEntry: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting sale: ' + error.message,
      );
    }
  }
}
