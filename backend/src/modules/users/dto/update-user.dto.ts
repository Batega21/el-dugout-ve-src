import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane', description: 'Updated first name' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith', description: 'Updated last name' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '555-123-4567', description: 'Updated mobile number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  mobileNumber?: string;

  @ApiPropertyOptional({ example: 'NewSecret123!', description: 'Updated password' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(72)
  password?: string;
}

