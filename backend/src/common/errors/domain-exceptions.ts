import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes.enum';
import { ErrorMessageCatalog } from './error-messages.catalog';

/**
 * Base Domain Exception.
 * Business services throw semantic domain exceptions instead of generic HTTP errors.
 * The Global Exception Filter intercepts these exceptions and guarantees a sanitized,
 * standardized user-facing API response contract.
 */
export class DomainException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: any;

  constructor(
    errorCode: ErrorCode,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    customMessage?: string,
    details?: any,
  ) {
    const safeMessage = customMessage || ErrorMessageCatalog.getMessage(errorCode);
    super(
      {
        success: false,
        statusCode,
        errorCode,
        message: safeMessage,
        details: details ?? null,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.details = details ?? null;
  }
}

// ---------------------------------------------------------------------------
// Authentication & Session Domain Exceptions
// ---------------------------------------------------------------------------

export class InvalidCredentialsException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED, customMessage, details);
  }
}

export class AccountInactiveException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_ACCOUNT_INACTIVE, HttpStatus.UNAUTHORIZED, customMessage, details);
  }
}

export class UnauthorizedException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_UNAUTHORIZED, HttpStatus.UNAUTHORIZED, customMessage, details);
  }
}

export class InvalidTokenException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_INVALID_TOKEN, HttpStatus.UNAUTHORIZED, customMessage, details);
  }
}

export class TokenExpiredException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED, customMessage, details);
  }
}

// ---------------------------------------------------------------------------
// Authorization & Entitlements Domain Exceptions
// ---------------------------------------------------------------------------

export class InsufficientPermissionsException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_INSUFFICIENT_PERMISSIONS, HttpStatus.FORBIDDEN, customMessage, details);
  }
}

export class SubscriptionTierRequiredException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_INSUFFICIENT_TIER, HttpStatus.FORBIDDEN, customMessage, details);
  }
}

// ---------------------------------------------------------------------------
// Resource & Entity Domain Exceptions
// ---------------------------------------------------------------------------

export class UserNotFoundException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_USER_NOT_FOUND, HttpStatus.NOT_FOUND, customMessage, details);
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, customMessage, details);
  }
}

export class SubscriptionNotFoundException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_SUBSCRIPTION_NOT_FOUND, HttpStatus.NOT_FOUND, customMessage, details);
  }
}

export class EmailAlreadyExistsException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT, customMessage, details);
  }
}

export class ResourceConflictException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_RESOURCE_CONFLICT, HttpStatus.CONFLICT, customMessage, details);
  }
}

// ---------------------------------------------------------------------------
// Validation & Request Domain Exceptions
// ---------------------------------------------------------------------------

export class ValidationFailedException extends DomainException {
  constructor(details?: any, customMessage?: string) {
    super(ErrorCode.ERR_VALIDATION_FAILED, HttpStatus.BAD_REQUEST, customMessage, details);
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(customMessage?: string, details?: any) {
    super(ErrorCode.ERR_BAD_REQUEST, HttpStatus.BAD_REQUEST, customMessage, details);
  }
}

/**
 * Type guard to verify if an error instance is a DomainException.
 */
export function isDomainException(error: unknown): error is DomainException {
  return (
    error instanceof DomainException ||
    (error instanceof HttpException &&
      typeof (error as any).errorCode === 'string' &&
      Object.values(ErrorCode).includes((error as any).errorCode))
  );
}
