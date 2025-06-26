import {
  IsUUID,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockEntryDto {
  @ApiProperty({
    example: 'uuid-user-id',
    description: 'ID of the user who made the stock entry',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'uuid-partner-id',
    description: 'ID of the partner who supplied the product',
  })
  @IsUUID()
  partnerId: string;

  @ApiProperty({
    example: 'uuid-product-id',
    description: 'ID of the product added to stock',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 100,
    description: 'Quantity of the product added to stock',
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 12.5,
    description: 'Buy price per unit of the product',
  })
  @IsNumber()
  buy_price: number;

  @ApiProperty({
    example: 'Urgent stock for high demand',
    required: false,
    description: 'Optional comment about the stock entry',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
