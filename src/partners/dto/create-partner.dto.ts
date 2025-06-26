import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { partner_role_enum } from '@prisma/client';

export class CreatePartnerDto {
  @ApiProperty({
    example: 'Ali Valiyev',
    description: 'Full name of the partner',
  })
  @IsString()
  @MinLength(2)
  fullname: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Unique phone number of the partner',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    example: 'securePass123',
    required: false,
    description: 'Optional password for the partner account',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: 'Tashkent, Uzbekistan',
    description: 'Partner address',
  })
  @IsString()
  address: string;
  @ApiProperty({
    example: partner_role_enum.CUSTOMER,
    enum: partner_role_enum,
    description: 'Partner role (CUSTOMER or SELLER)',
  })
  @IsEnum(partner_role_enum)
  role: partner_role_enum;

  @ApiProperty({
    example: 0.0,
    required: false,
    description: 'Initial balance (can be negative or positive)',
  })
  @IsOptional()
  @IsNumber()
  balance?: number = 0;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the partner is currently active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({
    example: '4d8fbd0e-dfcb-4e09-a7cc-1ff9b78fdc73',
    description: 'ID of the user who created the partner (owner)',
  })
  @IsUUID()
  userId: string;
}
