import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnedProductDto } from './dto/create-returned-product.dto';
import { Prisma, PrismaPromise, ReturnedProduct } from '@prisma/client';

@Injectable()
export class ReturnedProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateReturnedProductDto): Promise<ReturnedProduct> {
    try {
      const [sale, product] = await Promise.all([
        this.prisma.sale.findUnique({ where: { id: createDto.saleId } }),
        this.prisma.product.findUnique({ where: { id: createDto.productId } }),
      ]);

      if (!sale)
        throw new BadRequestException('Sale with given ID does not exist');
      if (!product)
        throw new BadRequestException('Product with given ID does not exist');
      if (createDto.quantity <= 0)
        throw new BadRequestException('Quantity should at least be 1');
      if (createDto.quantity > sale.quantity)
        throw new BadRequestException(
          'Quantity for return exceeds that of sale',
        );
      if (createDto.is_resellable)
        await this.prisma.product.update({
          where: { id: createDto.productId },
          data: { quantity: { increment: createDto.quantity } },
        });

      await this.prisma.partner.update({
        where: { id: sale.partnerId },
        data: {
          balance: { increment: sale.sell_price.mul(createDto.quantity) },
        },
      });

      return await this.prisma.returnedProduct.create({
        data: createDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Failed to create returned product: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ReturnedProductWhereUniqueInput;
    where?: Prisma.ReturnedProductWhereInput;
    orderBy?: Prisma.ReturnedProductOrderByWithRelationInput;
  }): Promise<ReturnedProduct[]> {
    try {
      return await this.prisma.returnedProduct.findMany({
        ...params,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Failed to fetch returned products: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<ReturnedProduct> {
    try {
      const item = await this.prisma.returnedProduct.findUnique({
        where: { id },
      });

      if (!item) throw new NotFoundException('Returned product not found');
      return item;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Failed to retrieve returned product: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateDto: Partial<CreateReturnedProductDto>,
  ): Promise<ReturnedProduct> {
    try {
      const existing = await this.prisma.returnedProduct.findUnique({
        where: { id },
      });
      if (!existing) throw new NotFoundException('Returned product not found');

      const [sale, product] = await Promise.all([
        updateDto.saleId
          ? this.prisma.sale.findUnique({ where: { id: updateDto.saleId } })
          : null,
        updateDto.productId
          ? this.prisma.product.findUnique({
              where: { id: updateDto.productId },
            })
          : null,
      ]);

      if (updateDto.saleId && !sale)
        throw new BadRequestException('Sale with given ID does not exist');
      if (updateDto.productId && !product)
        throw new BadRequestException('Product with given ID does not exist');

      const currentSale =
        sale ||
        (await this.prisma.sale.findUnique({ where: { id: existing.saleId } }));
      const currentProduct =
        product ||
        (await this.prisma.product.findUnique({
          where: { id: existing.productId },
        }));

      if (currentSale?.productId !== currentProduct?.id)
        throw new BadRequestException("Product and Sale don't match");

      const newQuantity = updateDto.quantity ?? existing.quantity;
      const newResellable =
        updateDto.is_resellable === undefined
          ? existing.is_resellable
          : updateDto.is_resellable;

      if (newQuantity <= 0)
        throw new BadRequestException('Quantity must be at least 1');

      if (newQuantity > currentSale!.quantity)
        throw new BadRequestException(
          'Returned quantity exceeds sale quantity',
        );
      //-------------------update client's balance if needed
      if (newResellable) {
        const updates: PrismaPromise<any>[] = [];

        if (existing.is_resellable) {
          updates.push(
            this.prisma.product.update({
              where: { id: existing.productId },
              data: { quantity: { decrement: existing.quantity } },
            }),
          );
        }

        updates.push(
          this.prisma.product.update({
            where: { id: currentProduct!.id },
            data: { quantity: { increment: newQuantity } },
          }),
        );

        await this.prisma.$transaction(updates);
      }

      return await this.prisma.returnedProduct.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Failed to update returned product: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<ReturnedProduct> {
    try {
      const exists = await this.prisma.returnedProduct.findUnique({
        where: { id },
      });
      if (!exists) throw new NotFoundException('Returned product not found');

      return await this.prisma.returnedProduct.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Failed to delete returned product: ' + error.message,
      );
    }
  }
}
