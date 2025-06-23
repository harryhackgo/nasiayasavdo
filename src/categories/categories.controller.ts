import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Create
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or category exists' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoriesService.create(createCategoryDto);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Find all with queries
  @Get()
  @ApiOperation({
    summary: 'Get all categories with filters, pagination, and sorting',
  })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 10 })
  @ApiQuery({ name: 'cursor', required: false, example: '5' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by fullname, categoryname, or phone',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    example: 'createdAt:desc',
    description: 'Sort by field and direction',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { time: { equals: parseInt(search) } },
      ];
    }

    let order: Prisma.CategoryOrderByWithRelationInput | undefined = undefined;
    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (
        field &&
        direction &&
        ['asc', 'desc'].includes(direction.toLowerCase())
      ) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.CategoryWhereUniqueInput | undefined = cursor
      ? { id: String(cursor) }
      : undefined;

    const queryParams = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursorObj,
      where,
      orderBy: order,
    };

    try {
      return await this.categoriesService.findAll(queryParams);
    } catch {
      throw new HttpException(
        'Failed to retrieve categories',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Find one
  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID (number)' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  // Update
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID (number)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updated = await this.categoriesService.update(id, updateCategoryDto);
    if (!updated) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // Delete
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID (number)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.categoriesService.remove(id);
    if (!deleted) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Category deleted successfully' };
  }
}
