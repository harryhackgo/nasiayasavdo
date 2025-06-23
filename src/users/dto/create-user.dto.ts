import {
  IsString,
  IsPhoneNumber,
  IsBoolean,
  IsOptional,
  MinLength,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @MinLength(2)
  fullname: string;

  @ApiProperty({ example: 'johndoe', description: 'Unique login username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Primary phone number',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the user is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = false;

  @ApiProperty({
    example: 0.0,
    required: false,
    description:
      'User balance, can be negative (in debt) or positive (credited)',
  })
  @IsOptional()
  @IsNumber()
  balance?: number = 0;

  @ApiProperty({
    example: Role.STAFF,
    enum: Role,
    description: 'User role (ADMIN or STAFF)',
  })
  @IsEnum(Role)
  role: Role;
}
