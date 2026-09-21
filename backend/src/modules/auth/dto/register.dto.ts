import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiProperty({ example: 'newuser@example.com', description: 'User unique email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email address is required' })
  @MaxLength(255, { message: 'Email address must not exceed 255 characters' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({
    example: '555-123-4567',
    description: 'User mobile contact number (numbers and dashes only)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Mobile number must not exceed 20 characters' })
  @Matches(/^[0-9-]*$/, {
    message: 'Mobile number must contain only numerical characters and dashes',
  })
  mobileNumber?: string;
}

