import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Units {
  KG = 'kg',
  DONA = 'dona',
  LITR = 'litr',
  M2 = 'm2',
}

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 14 Pro',
    description: 'Title or name of the product',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 1200.99,
    description: 'Selling price of the product',
  })
  @IsNumber()
  @Min(0)
  sell_price: number;

  @ApiProperty({
    example: 950.5,
    description: 'Buying cost of the product',
  })
  @IsNumber()
  @Min(0)
  buy_price: number;

  @ApiProperty({
    example: 50,
    description: 'Quantity of the product in stock',
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: Units.KG,
    enum: Units,
    description: 'Measurement unit of the product',
  })
  @IsEnum(Units)
  units: Units;

  @ApiProperty({
    example: 'Top-selling smartphone in 2024',
    required: false,
    description: 'Optional comment or note about the product',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    example: 'Top-selling smartphone in 2024',
    required: false,
    description: 'Optional image or note about the product',
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the product is active or archived',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({
    example: 'c2e4ef5d-4dc7-41c5-b3d1-bf4b8a456821',
    description: 'UUID of the user who created this product',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: '79b0cc7e-17fb-4412-a7d2-47a1d10c3c3d',
    description: 'UUID of the category this product belongs to',
  })
  @IsUUID()
  categoryId: string;
}
