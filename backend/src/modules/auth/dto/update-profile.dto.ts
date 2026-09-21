import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    example: '555-123-4567',
    description: 'User mobile contact number (numbers and dashes only)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[0-9-]*$/, {
    message: 'Mobile number must contain only numerical characters and dashes',
  })
  mobileNumber?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL or base64 data string of the avatar image',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Toggle two-factor authentication',
  })
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    example: 'CurrentPassword123!',
    description: 'Current password for verification when updating password',
  })
  @IsString()
  @IsOptional()
  @MaxLength(72)
  currentPassword?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPassword123!',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @MaxLength(72)
  @IsOptional()
  newPassword?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPassword123!',
    description: 'Confirmation of new password',
  })
  @IsString()
  @IsOptional()
  @MaxLength(72)
  confirmPassword?: string;
}
