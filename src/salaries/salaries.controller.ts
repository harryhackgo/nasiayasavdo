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
import { SalariesService } from './salaries.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('Salaries')
@Controller('salaries')
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) {}

  // CREATE
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new salary record' })
  @ApiResponse({ status: 201, description: 'Salary created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or user not found' })
  async create(@Body() createSalaryDto: CreateSalaryDto) {
    try {
      return await this.salariesService.create(createSalaryDto);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiOperation({
    summary: 'Get all salaries with filters, pagination, and sorting',
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
    description: 'List of salaries retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    let order: Prisma.SalaryOrderByWithRelationInput | undefined = undefined;

    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.SalaryWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.salariesService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve salaries',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a salary by ID' })
  @ApiParam({ name: 'id', description: 'Salary ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Salary found' })
  @ApiResponse({ status: 404, description: 'Salary not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const salary = await this.salariesService.findOne(id);
    if (!salary) {
      throw new HttpException('Salary not found', HttpStatus.NOT_FOUND);
    }
    return salary;
  }

  // UPDATE
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a salary by ID' })
  @ApiParam({ name: 'id', description: 'Salary ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Salary updated successfully' })
  @ApiResponse({ status: 404, description: 'Salary not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    const updated = await this.salariesService.update(id, updateSalaryDto);
    if (!updated) {
      throw new HttpException('Salary not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a salary by ID' })
  @ApiParam({ name: 'id', description: 'Salary ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Salary deleted successfully' })
  @ApiResponse({ status: 404, description: 'Salary not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.salariesService.remove(id);
    if (!deleted) {
      throw new HttpException('Salary not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Salary deleted successfully' };
  }
}
