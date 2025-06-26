import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSalaryDto {
  @ApiProperty({
    description: 'UUID of the user receiving the salary',
    example: 'b8a1b9a7-cc61-4c6b-8a84-96c6aef89e2a',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Amount of the salary (decimal)',
    example: 1200.5,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Optional comment or description for the salary',
    example: 'Monthly bonus for performance',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
