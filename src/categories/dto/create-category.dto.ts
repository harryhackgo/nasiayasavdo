import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'The title/name of the category',
  })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({
    example: 1695059938,
    description: 'UNIX timestamp or any integer to represent time',
  })
  @IsInt()
  time: number;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the category is active or archived',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
