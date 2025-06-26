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
import { StockEntriesService } from './stock-entries.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { UpdateStockEntryDto } from './dto/update-stock-entry.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('Stock Entries')
@Controller('stock-entries')
export class StockEntriesController {
  constructor(private readonly stockEntriesService: StockEntriesService) {}

  // CREATE
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new stock entry' })
  @ApiResponse({ status: 201, description: 'Stock entry created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or entry error' })
  async create(@Body() createDto: CreateStockEntryDto) {
    try {
      return await this.stockEntriesService.create(createDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all stock entries with filters, pagination, and sorting',
  })
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
    description: 'List of stock entries retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    let order: Prisma.StockEntryOrderByWithRelationInput | undefined =
      undefined;

    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.StockEntryWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.stockEntriesService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        where: {},
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve stock entries',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single stock entry by ID' })
  @ApiParam({ name: 'id', description: 'Stock Entry ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Stock entry found' })
  @ApiResponse({ status: 404, description: 'Stock entry not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const entry = await this.stockEntriesService.findOne(id);
    if (!entry) {
      throw new HttpException('Stock entry not found', HttpStatus.NOT_FOUND);
    }
    return entry;
  }

  // UPDATE
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a stock entry by ID' })
  @ApiParam({ name: 'id', description: 'Stock Entry ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Stock entry updated successfully' })
  @ApiResponse({ status: 404, description: 'Stock entry not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateStockEntryDto,
  ) {
    const updated = await this.stockEntriesService.update(id, updateDto);
    if (!updated) {
      throw new HttpException('Stock entry not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a stock entry by ID' })
  @ApiParam({ name: 'id', description: 'Stock Entry ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Stock entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stock entry not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.stockEntriesService.remove(id);
    if (!deleted) {
      throw new HttpException('Stock entry not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Stock entry deleted successfully' };
  }
}
