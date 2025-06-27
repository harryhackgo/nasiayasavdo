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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
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
@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // CREATE
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or related entity missing',
  })
  async create(@Body() createDto: CreateSaleDto) {
    try {
      return await this.salesService.create(createDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sales with pagination and sorting' })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 10 })
  @ApiQuery({ name: 'cursor', required: false, example: 'uuid' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    example: 'createdAt:desc',
    description: 'Sort by field and direction',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sales retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    let order: Prisma.SaleOrderByWithRelationInput | undefined = undefined;

    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.SaleWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.salesService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        where: {},
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve sales',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Sale found' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const sale = await this.salesService.findOne(id);
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }
    return sale;
  }

  // UPDATE
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSaleDto,
  ) {
    const updated = await this.salesService.update(id, updateDto);
    if (!updated) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Sale deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.salesService.remove(id);
    if (!deleted) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Sale deleted successfully' };
  }
}
