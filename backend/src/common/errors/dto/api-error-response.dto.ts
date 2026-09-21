import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standardized API Error Response Contract.
 * Every error returned across all endpoints conforms to this predictable structure.
 */
export class ApiErrorResponse {
  @ApiProperty({
    description: 'Indicates whether the request succeeded or failed',
    example: false,
  })
  readonly success: boolean = false;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  readonly statusCode: number;

  @ApiProperty({
    description: 'Constant machine-readable error code for UI logic and localization',
    example: 'ERR_VALIDATION_FAILED',
  })
  readonly errorCode: string;

  @ApiProperty({
    description: 'Sanitized, actionable human-readable message',
    example: 'One or more fields failed validation. Please review the highlighted fields.',
  })
  readonly message: string;

  @ApiPropertyOptional({
    description: 'Safe structured details (such as field-level validation errors)',
    example: ['email must be an email', 'password is too short'],
    nullable: true,
  })
  readonly details?: any;

  @ApiProperty({
    description: 'ISO 8601 timestamp of when the error occurred',
    example: '2026-09-12T12:00:00.000Z',
  })
  readonly timestamp: string;

  @ApiProperty({
    description: 'Request path that triggered the error',
    example: '/api/auth/login',
  })
  readonly path: string;

  constructor(partial: Partial<ApiErrorResponse>) {
    Object.assign(this, partial);
    this.success = false;
  }
}
