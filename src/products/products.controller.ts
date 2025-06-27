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
  // UseInterceptors,
  // UploadedFile,
  // BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
// import { FileInterceptor } from '@nestjs/platform-express';
// import * as multerS3 from 'multer-s3';
// import { s3 } from '../config/s3.config';
// import { v4 as uuidv4 } from 'uuid';

// interface S3MulterFile extends Express.Multer.File {
//   location: string; // URL of the uploaded image
// }

@UseGuards(RolesGuard)
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // CREATE
  @Post()
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: multerS3({
  //       s3,
  //       bucket: 'satil',
  //       acl: 'public-read',
  //       key: (req, file, cb) => {
  //         const filename = `${uuidv4()}-${file.originalname}`;
  //         cb(null, filename);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
  //         return cb(
  //           new BadRequestException('Only image files are allowed!'),
  //           false,
  //         );
  //       }
  //       cb(null, true);
  //     },
  //     limits: { fileSize: 5 * 1024 * 1024 },
  //   }),
  // )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or product exists' })
  async create(
    // @UploadedFile() file: S3MulterFile,
    @Body() createProductDto: CreateProductDto,
  ) {
    try {
      // const image_url = file?.location;
      return await this.productsService.create({
        ...createProductDto,
        // image_url,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET ALL
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all products with filters, pagination, and sorting',
  })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 10 })
  @ApiQuery({ name: 'cursor', required: false, example: 'uuid' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or comment',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    example: 'createdAt:desc',
    description: 'Sort by field and direction',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
      ];
    }

    let order: Prisma.ProductOrderByWithRelationInput | undefined = undefined;
    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      if (['asc', 'desc'].includes(direction?.toLowerCase())) {
        order = { [field]: direction.toLowerCase() as 'asc' | 'desc' };
      }
    }

    const cursorObj: Prisma.ProductWhereUniqueInput | undefined = cursor
      ? { id: cursor }
      : undefined;

    try {
      return await this.productsService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        cursor: cursorObj,
        where,
        orderBy: order,
      });
    } catch {
      throw new HttpException(
        'Failed to retrieve products',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET ONE
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  // UPDATE
  @Patch(':id')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: multerS3({
  //       s3,
  //       bucket: 'satil',
  //       acl: 'public-read',
  //       key: (req, file, cb) => {
  //         const filename = `${uuidv4()}-${file.originalname}`;
  //         cb(null, filename);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
  //         return cb(
  //           new BadRequestException('Only image files are allowed!'),
  //           false,
  //         );
  //       }
  //       cb(null, true);
  //     },
  //     limits: { fileSize: 5 * 1024 * 1024 },
  //   }),
  // )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updated = await this.productsService.update(id, updateProductDto);
    if (!updated) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // DELETE
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.productsService.remove(id);
    if (!deleted) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Product deleted successfully' };
  }
}
