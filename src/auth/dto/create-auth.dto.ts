import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    example: '+998937034407',
    description: 'Valid phone of the user',
  })
  @IsPhoneNumber('UZ', { message: 'Invalid phone number' })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  phone: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
