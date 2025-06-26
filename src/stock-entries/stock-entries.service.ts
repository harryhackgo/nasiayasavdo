import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { UpdateStockEntryDto } from './dto/update-stock-entry.dto';
import { Prisma, StockEntry } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StockEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateStockEntryDto): Promise<StockEntry> {
    try {
      const existingPartner = await this.prisma.partner.findUnique({
        where: { id: createDto.partnerId },
      });
      if (!existingPartner)
        throw new BadRequestException("Partner with this id doesn't exists");

      const existingUser = await this.prisma.user.findUnique({
        where: { id: createDto.userId },
      });
      if (!existingUser)
        throw new BadRequestException("User with this id doesn't exists");

      const existingProduct = await this.prisma.product.findUnique({
        where: { id: createDto.productId },
      });
      if (!existingProduct)
        throw new BadRequestException("Product with this id doesn't exists");
      if (!existingPartner.is_active)
        throw new BadRequestException('Partner is not active');
      if (existingPartner.role != 'SELLER')
        throw new BadRequestException('Role of the partner should be SELLER');
      if (!existingUser.is_active)
        throw new BadRequestException('User is not active');
      if (!existingProduct.is_active)
        throw new BadRequestException('Product is not active');

      await this.prisma.$transaction([
        this.prisma.partner.update({
          where: { id: createDto.partnerId },
          data: {
            balance: existingPartner.balance.sub(
              createDto.buy_price * createDto.quantity,
            ),
          },
        }),
        this.prisma.product.update({
          where: { id: createDto.productId },
          data: {
            quantity: { increment: createDto.quantity },
            buy_price: existingProduct.buy_price
              .mul(existingProduct.quantity)
              .add(new Decimal(createDto.buy_price).mul(createDto.quantity))
              .div(existingProduct.quantity + createDto.quantity),
          },
        }),
      ]);

      return await this.prisma.stockEntry.create({
        data: createDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating stock entry: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StockEntryWhereUniqueInput;
    where?: Prisma.StockEntryWhereInput;
    orderBy?: Prisma.StockEntryOrderByWithRelationInput;
  }): Promise<StockEntry[]> {
    try {
      return await this.prisma.stockEntry.findMany({
        ...params,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching stock entries: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<StockEntry> {
    try {
      const entry = await this.prisma.stockEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        throw new NotFoundException('Stock entry not found');
      }

      return entry;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching stock entry: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateDto: UpdateStockEntryDto,
  ): Promise<StockEntry> {
    try {
      const exists = await this.prisma.stockEntry.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Stock entry not found');

      const [newPartner, newUser, newProduct, currentPartner, currentProduct] =
        await Promise.all([
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
          this.prisma.partner.findUnique({ where: { id: exists.partnerId } }),
          this.prisma.product.findUnique({ where: { id: exists.productId } }),
        ]);

      if (updateDto.partnerId && !newPartner)
        throw new BadRequestException("Partner with this id doesn't exist");
      if (updateDto.partnerId && newPartner?.role != 'SELLER')
        throw new BadRequestException('Role of the partner should be SELLER');
      if (updateDto.userId && !newUser)
        throw new BadRequestException("User with this id doesn't exist");
      if (updateDto.productId && !newProduct)
        throw new BadRequestException("Product with this id doesn't exist");

      const oldTotal = exists.buy_price.mul(exists.quantity);
      const newBuyPrice = updateDto.buy_price
        ? new Decimal(updateDto.buy_price)
        : exists.buy_price;
      const newQuantity = updateDto.quantity ?? exists.quantity;
      const newTotal = newBuyPrice.mul(newQuantity);

      const isPartnerChanged =
        updateDto.partnerId && updateDto.partnerId !== exists.partnerId;
      const isProductChanged =
        updateDto.productId && updateDto.productId !== exists.productId;

      await this.prisma.$transaction(async (tx) => {
        if (isPartnerChanged) {
          await tx.partner.update({
            where: { id: exists.partnerId },
            data: { balance: currentPartner!.balance.add(oldTotal) },
          });
          await tx.partner.update({
            where: { id: updateDto.partnerId },
            data: { balance: newPartner!.balance.sub(newTotal) },
          });
        } else {
          await tx.partner.update({
            where: { id: exists.partnerId },
            data: {
              balance: currentPartner!.balance.add(oldTotal).sub(newTotal),
            },
          });
        }

        if (isProductChanged) {
          const revertedBuyTotal = currentProduct!.buy_price
            .mul(currentProduct!.quantity)
            .sub(oldTotal);
          const revertedQuantity = currentProduct!.quantity - exists.quantity;

          const newOldBuyPrice =
            revertedQuantity > 0
              ? revertedBuyTotal.div(revertedQuantity)
              : new Decimal(0);

          await tx.product.update({
            where: { id: exists.productId },
            data: {
              quantity: { decrement: exists.quantity },
              buy_price: newOldBuyPrice,
            },
          });

          const updatedBuyTotal = newProduct!.buy_price
            .mul(newProduct!.quantity)
            .add(newBuyPrice.mul(newQuantity));
          const updatedQuantity = newProduct!.quantity + newQuantity;

          const updatedBuyPrice = updatedBuyTotal.div(updatedQuantity);

          await tx.product.update({
            where: { id: updateDto.productId },
            data: {
              quantity: { increment: newQuantity },
              buy_price: updatedBuyPrice,
            },
          });
        } else if (updateDto.buy_price || updateDto.quantity) {
          const revertedBuyTotal = currentProduct!.buy_price
            .mul(currentProduct!.quantity)
            .sub(oldTotal);
          const revertedQuantity = currentProduct!.quantity - exists.quantity;

          const newBuyTotal = revertedBuyTotal.add(
            newBuyPrice.mul(newQuantity),
          );
          const newTotalQuantity = revertedQuantity + newQuantity;

          const newAvgPrice =
            newTotalQuantity > 0
              ? newBuyTotal.div(newTotalQuantity)
              : new Decimal(0);

          await tx.product.update({
            where: { id: exists.productId },
            data: {
              quantity: {
                decrement: exists.quantity,
                increment: newQuantity,
              },
              buy_price: newAvgPrice,
            },
          });
        }

        await tx.stockEntry.update({
          where: { id },
          data: updateDto,
        });
      });

      const res = await this.prisma.stockEntry.findUnique({
        where: { id },
      });
      if (!res) {
        throw new BadRequestException(
          'Stock-entry has been updated successfully. However, we could not get the update',
        );
      }
      return res;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating stock entry: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<StockEntry> {
    try {
      const exists = await this.prisma.stockEntry.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Stock entry not found');

      return await this.prisma.stockEntry.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting stock entry: ' + error.message,
      );
    }
  }
}
