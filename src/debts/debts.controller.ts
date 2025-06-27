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
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { debt_status_enum, Prisma } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';

@UseGuards(RolesGuard)
@ApiTags('Debts')
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  // CREATE
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new debt' })
  @ApiResponse({ status: 201, description: 'Debt created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or related sale does not exist',
  })
  async create(@Body() createDto: CreateDebtDto) {
    try {
      return await this.debtsService.create(createDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all debts with pagination and sorting' })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 10 })
  @ApiQuery({ name: 'cursor', required: false, example: 'uuid' })
  @ApiQuery({ name: 'search', required: false, example: 'OVERDUE' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    example: 'createdAt:desc',
    description: 'Sort by field and direction',
  })
  @ApiResponse({
    status: 200,
    description: 'List of debts retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('search') search?: debt_status_enum,
    @Query('orderBy') orderBy?: string,
  ) {
    const where: Prisma.DebtWhereInput = {};

    if (search) {
      where.OR = [{ status: { equals: search } }];
    }
    let order: Prisma.DebtOrderByWithRelationInput | undefined = undefined;

    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.DebtWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.debtsService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        where,
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve debts',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single debt by ID' })
  @ApiParam({ name: 'id', description: 'Debt ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Debt found' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const debt = await this.debtsService.findOne(id);
    if (!debt) {
      throw new HttpException('Debt not found', HttpStatus.NOT_FOUND);
    }
    return debt;
  }

  // UPDATE
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a debt by ID' })
  @ApiParam({ name: 'id', description: 'Debt ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Debt updated successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDebtDto,
  ) {
    const updated = await this.debtsService.update(id, updateDto);
    if (!updated) {
      throw new HttpException('Debt not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a debt by ID' })
  @ApiParam({ name: 'id', description: 'Debt ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Debt deleted successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.debtsService.remove(id);
    if (!deleted) {
      throw new HttpException('Debt not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Debt deleted successfully' };
  }
}
