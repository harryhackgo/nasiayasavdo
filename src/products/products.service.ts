import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const existingProduct = await this.prisma.product.findFirst({
        where: { title: createProductDto.title },
      });

      if (existingProduct) {
        throw new BadRequestException('Product with this title already exists');
      }

      const [user, category] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: createProductDto.userId },
        }),
        this.prisma.category.findUnique({
          where: { id: createProductDto.categoryId },
        }),
      ]);

      if (!user)
        throw new BadRequestException("User with this id doesn't exist");
      if (!category)
        throw new BadRequestException("Category with this id doesn't exist");

      return await this.prisma.product.create({
        data: createProductDto,
        include: { category: true }, // Include category in response
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating product: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        ...params,
        include: { category: true }, // Include related category
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching products: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) throw new NotFoundException('Product not found');

      return product;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching product: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');

      const [user, category] = await Promise.all([
        updateProductDto.userId
          ? this.prisma.user.findUnique({
              where: { id: updateProductDto.userId },
            })
          : null,
        updateProductDto.categoryId
          ? this.prisma.category.findUnique({
              where: { id: updateProductDto.categoryId },
            })
          : null,
      ]);

      if (updateProductDto.userId && !user)
        throw new BadRequestException("User with this id doesn't exist");
      if (updateProductDto.categoryId && !category)
        throw new BadRequestException("Category with this id doesn't exist");

      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: { category: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating product: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');

      return await this.prisma.product.delete({
        where: { id },
        include: { category: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting product: ' + error.message,
      );
    }
  }
}
