import {
  IsUUID,
  IsNumber,
  IsInt,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { debt_status_enum } from '@prisma/client';

export class CreateDebtDto {
  @ApiProperty({
    example: 'uuid-of-sale',
    description: 'UUID of the related sale',
  })
  @IsUUID()
  saleId: string;

  @ApiProperty({
    example: 250000.0,
    description: 'Total debt amount',
  })
  @IsNumber()
  total_debt: number;

  @ApiProperty({
    example: 50000.0,
    description: 'Amount already paid',
  })
  @IsNumber()
  paid_amount: number;

  @ApiProperty({
    example: '2025-07-01T00:00:00Z',
    description: 'Next payment due date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  next_due_date?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the payment is late',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_late?: boolean;

  @ApiProperty({
    example: 1710000000,
    description: 'Unix timestamp of when the debt was created',
  })
  @IsInt()
  time: number;

  @ApiProperty({
    enum: debt_status_enum,
    example: debt_status_enum.OPEN,
    description: 'Status of the debt',
    default: debt_status_enum.OPEN,
  })
  @IsEnum(debt_status_enum)
  status: debt_status_enum;
}
