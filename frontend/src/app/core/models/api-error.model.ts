/**
 * Standardized application-wide error codes.
 * Enables the frontend to trigger specific UI logic (e.g. highlighting fields,
 * opening subscription modals, redirecting on session expiry) without parsing fragile text strings.
 */
export enum ErrorCode {
  // Authentication & Session
  ERR_INVALID_CREDENTIALS = 'ERR_INVALID_CREDENTIALS',
  ERR_ACCOUNT_INACTIVE = 'ERR_ACCOUNT_INACTIVE',
  ERR_UNAUTHORIZED = 'ERR_UNAUTHORIZED',
  ERR_TOKEN_EXPIRED = 'ERR_TOKEN_EXPIRED',
  ERR_INVALID_TOKEN = 'ERR_INVALID_TOKEN',
  ERR_FORBIDDEN = 'ERR_FORBIDDEN',

  // Entitlements & Authorization
  ERR_INSUFFICIENT_PERMISSIONS = 'ERR_INSUFFICIENT_PERMISSIONS',
  ERR_INSUFFICIENT_TIER = 'ERR_INSUFFICIENT_TIER',

  // Domain & Resources
  ERR_USER_NOT_FOUND = 'ERR_USER_NOT_FOUND',
  ERR_RESOURCE_NOT_FOUND = 'ERR_RESOURCE_NOT_FOUND',
  ERR_EMAIL_ALREADY_EXISTS = 'ERR_EMAIL_ALREADY_EXISTS',
  ERR_RESOURCE_CONFLICT = 'ERR_RESOURCE_CONFLICT',
  ERR_SUBSCRIPTION_NOT_FOUND = 'ERR_SUBSCRIPTION_NOT_FOUND',

  // Validation & Input
  ERR_VALIDATION_FAILED = 'ERR_VALIDATION_FAILED',
  ERR_BAD_REQUEST = 'ERR_BAD_REQUEST',

  // Database & System
  ERR_DATABASE_ERROR = 'ERR_DATABASE_ERROR',
  ERR_INTERNAL_SERVER_ERROR = 'ERR_INTERNAL_SERVER_ERROR',
  ERR_SERVICE_UNAVAILABLE = 'ERR_SERVICE_UNAVAILABLE',
}

/**
 * Standardized API Error Response Contract.
 * Every error payload returned by the backend conforms to this structure.
 */
export interface ApiErrorResponse<T = any> {
  success: false;
  statusCode: number;
  errorCode: ErrorCode | string;
  message: string;
  details?: T | null;
  timestamp: string;
  path: string;
}

/**
 * Extracts a safe, human-readable error message from an HTTP error response.
 */
export function getApiErrorMessage(error: any, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback;

  // Standardized ApiErrorResponse payload
  if (error.error?.message && typeof error.error.message === 'string') {
    return error.error.message;
  }

  // Array of validation messages
  if (Array.isArray(error.error?.details)) {
    return error.error.details.join(', ');
  }

  if (typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
}
