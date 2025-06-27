import { IsUUID, IsInt, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({
    example: 'uuid-of-partner',
    description: 'UUID of the partner making the purchase',
  })
  @IsUUID()
  partnerId: string;

  @ApiProperty({
    example: 'uuid-of-product',
    description: 'UUID of the product being sold',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 'uuid-of-stock-entry',
    description: 'UUID of the stock entry related to the sale',
  })
  @IsUUID()
  @IsOptional()
  stockEntryId?: string;

  @ApiProperty({
    example: 5,
    description: 'Quantity of product sold',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 15000.5,
    description: 'Selling price per unit at the time of sale',
  })
  @IsNumber()
  sell_price: number;

  @ApiProperty({
    example: 1710000000,
    description: 'UNIX timestamp of the sale',
  })
  @IsInt()
  @IsOptional()
  time: number;

  @ApiProperty({
    example: 'uuid-of-user',
    description: 'UUID of the user (staff) who processed the sale',
  })
  @IsUUID()
  userId: string;
}
