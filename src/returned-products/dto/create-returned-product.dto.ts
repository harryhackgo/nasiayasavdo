import {
  IsUUID,
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReturnedProductDto {
  @ApiProperty({
    example: 'uuid-of-sale',
    description: 'UUID of the sale associated with this return',
  })
  @IsUUID()
  saleId: string;

  @ApiProperty({
    example: 'uuid-of-product',
    description: 'UUID of the returned product',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 3,
    description: 'Quantity of product returned',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: true,
    description: 'Whether the returned product is suitable for reselling',
  })
  @IsBoolean()
  is_resellable: boolean;

  @ApiProperty({
    required: false,
    example: 'Damaged packaging',
    description: 'Optional reason for the product return',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
