import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { payment_type_enum, payment_flow_enum } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'uuid-of-partner',
    description: 'UUID of the partner who made the payment',
  })
  @IsUUID()
  partnerId: string;

  @ApiProperty({
    example: 'uuid-of-debt (optional)',
    required: false,
    description: 'UUID of the related debt, if applicable',
  })
  @IsOptional()
  @IsUUID()
  debtId?: string;

  @ApiProperty({
    example: 'uuid-of-user',
    description: 'UUID of the staff/user who processed the payment',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 100000.5,
    description: 'Amount paid',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'Payment for May installment',
    required: false,
    description: 'Optional comment or note regarding the payment',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    enum: payment_type_enum,
    example: payment_type_enum.CASH,
    description: 'Payment type (e.g., CASH, CARD, BANK_TRANSFER)',
  })
  @IsEnum(payment_type_enum)
  payment_type: payment_type_enum;

  @ApiProperty({
    enum: payment_flow_enum,
    example: payment_flow_enum.IN,
    description: 'Flow type: IN (income) or OUT (expense)',
  })
  @IsEnum(payment_flow_enum)
  type: payment_flow_enum;
}
