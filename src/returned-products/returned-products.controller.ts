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
  UseGuards,
} from '@nestjs/common';
import { ReturnedProductsService } from './returned-products.service';
import { CreateReturnedProductDto } from './dto/create-returned-product.dto';
import { UpdateReturnedProductDto } from './dto/update-returned-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';

@UseGuards(RolesGuard)
@ApiTags('Returned Products')
@Controller('returned-products')
export class ReturnedProductsController {
  constructor(
    private readonly returnedProductsService: ReturnedProductsService,
  ) {}

  // CREATE
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a returned product' })
  @ApiResponse({ status: 201, description: 'Returned product created' })
  @ApiResponse({ status: 400, description: 'Invalid input or relation' })
  async create(@Body() dto: CreateReturnedProductDto) {
    try {
      return await this.returnedProductsService.create(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all returned products with filters' })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 10 })
  @ApiQuery({ name: 'cursor', required: false, example: 'uuid' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    example: 'createdAt:desc',
    description: 'Sort by field and direction',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    let order: Prisma.ReturnedProductOrderByWithRelationInput | undefined =
      undefined;

    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.ReturnedProductWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.returnedProductsService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        where: {},
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve returned products',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single returned product by ID' })
  @ApiParam({ name: 'id', description: 'ReturnedProduct ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returned product found' })
  @ApiResponse({ status: 404, description: 'Returned product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const entity = await this.returnedProductsService.findOne(id);
    if (!entity) {
      throw new HttpException(
        'Returned product not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return entity;
  }

  // UPDATE
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a returned product by ID' })
  @ApiParam({ name: 'id', description: 'ReturnedProduct ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returned product updated' })
  @ApiResponse({ status: 404, description: 'Returned product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReturnedProductDto,
  ) {
    const updated = await this.returnedProductsService.update(id, dto);
    if (!updated) {
      throw new HttpException(
        'Returned product not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a returned product by ID' })
  @ApiParam({ name: 'id', description: 'ReturnedProduct ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returned product deleted' })
  @ApiResponse({ status: 404, description: 'Returned product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.returnedProductsService.remove(id);
    if (!deleted) {
      throw new HttpException(
        'Returned product not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Returned product deleted successfully' };
  }
}
