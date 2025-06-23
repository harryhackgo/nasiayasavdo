import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          OR: [{ title: createCategoryDto.title }],
        },
      });

      if (existingCategory) {
        throw new BadRequestException(
          'Category with this title or phone already exists',
        );
      }

      const category = await this.prisma.category.create({
        data: {
          ...createCategoryDto,
        },
      });

      return category;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating category: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CategoryWhereUniqueInput;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }): Promise<Category[]> {
    try {
      return await this.prisma.category.findMany({
        ...params,
        include: {},
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching categories: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Category> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) throw new NotFoundException('Category not found');

      return category;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching category: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundException('Category not found');

      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating category: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundException('Category not found');

      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting category: ' + error.message,
      );
    }
  }
}
