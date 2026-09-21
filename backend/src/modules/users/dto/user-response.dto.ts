import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'c0a8012e-8d19-4f32-8419-44d567781bcf' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: '555-123-4567' })
  mobileNumber?: string | null;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://lh3.googleusercontent.com/a/default' })
  avatarUrl?: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  role: string;

  @ApiPropertyOptional({ example: 'FREE', enum: ['FREE', 'BASIC', 'PREMIUM'] })
  tier?: string;

  @ApiProperty({ example: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
