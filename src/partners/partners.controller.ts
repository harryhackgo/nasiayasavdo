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
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
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
@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // CREATE
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({ status: 201, description: 'Partner created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or partner exists' })
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    try {
      return await this.partnersService.create(createPartnerDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all partners with filters, pagination, and sorting',
  })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 10 })
  @ApiQuery({ name: 'cursor', required: false, example: 'uuid' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by fullname, phone, or address',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    example: 'createdAt:desc',
    description: 'Sort by field and direction',
  })
  @ApiResponse({
    status: 200,
    description: 'List of partners retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const where: Prisma.PartnerWhereInput = {};

    if (search) {
      where.OR = [
        { fullname: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    let order: Prisma.PartnerOrderByWithRelationInput | undefined = undefined;
    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.PartnerWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.partnersService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        where,
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve partners',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Partner found' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const partner = await this.partnersService.findOne(id);
    if (!partner) {
      throw new HttpException('Partner not found', HttpStatus.NOT_FOUND);
    }
    return partner;
  }

  // UPDATE
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    const updated = await this.partnersService.update(id, updatePartnerDto);
    if (!updated) {
      throw new HttpException('Partner not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.partnersService.remove(id);
    if (!deleted) {
      throw new HttpException('Partner not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Partner deleted successfully' };
  }
}
