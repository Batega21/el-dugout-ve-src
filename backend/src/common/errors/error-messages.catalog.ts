import { ErrorCode } from './error-codes.enum';

/**
 * Centralized catalog of user-facing messages.
 * Keeps messages actionable, human-readable, and free of backend implementation details.
 * Structured to support seamless localization (i18n) in future expansions.
 */
export class ErrorMessageCatalog {
  private static readonly MESSAGES_EN: Record<ErrorCode, string> = {
    // Authentication & Session
    [ErrorCode.ERR_INVALID_CREDENTIALS]:
      'The email or password you entered is incorrect. Please verify your credentials and try again.',
    [ErrorCode.ERR_ACCOUNT_INACTIVE]:
      'Your account is currently inactive. Please check your email for activation instructions or contact support.',
    [ErrorCode.ERR_UNAUTHORIZED]:
      'Authentication is required to access this resource. Please sign in to continue.',
    [ErrorCode.ERR_TOKEN_EXPIRED]:
      'Your session has expired. Please sign in again to continue.',
    [ErrorCode.ERR_INVALID_TOKEN]:
      'Your session token is invalid or malformed. Please sign in again.',
    [ErrorCode.ERR_FORBIDDEN]:
      'You do not have permission to perform this action.',

    // Entitlements & Authorization
    [ErrorCode.ERR_INSUFFICIENT_PERMISSIONS]:
      'Access denied. Your account does not have the required permissions for this action.',
    [ErrorCode.ERR_INSUFFICIENT_TIER]:
      'This feature requires a higher subscription tier. Please upgrade your subscription plan to gain access.',

    // Domain & Resources
    [ErrorCode.ERR_USER_NOT_FOUND]:
      'The requested user could not be found. Please verify the user identifier and try again.',
    [ErrorCode.ERR_RESOURCE_NOT_FOUND]:
      'The requested resource could not be found. It may have been moved or deleted.',
    [ErrorCode.ERR_EMAIL_ALREADY_EXISTS]:
      'An account with this email address already exists. Please sign in or use a different email address.',
    [ErrorCode.ERR_RESOURCE_CONFLICT]:
      'A record with this information already exists. Please review your entries and try again.',
    [ErrorCode.ERR_SUBSCRIPTION_NOT_FOUND]:
      'The requested subscription could not be found. Please check the subscription ID.',

    // Validation & Input
    [ErrorCode.ERR_VALIDATION_FAILED]:
      'One or more fields failed validation. Please review the highlighted fields and correct the errors.',
    [ErrorCode.ERR_BAD_REQUEST]:
      'The request could not be processed due to invalid parameters or formatting. Please check your input.',

    // Database & System
    [ErrorCode.ERR_DATABASE_ERROR]:
      'A database operation could not be completed. Please try again in a few moments or contact support.',
    [ErrorCode.ERR_INTERNAL_SERVER_ERROR]:
      'An unexpected error occurred while processing your request. Please try again later.',
    [ErrorCode.ERR_SERVICE_UNAVAILABLE]:
      'The service is temporarily unavailable. Please try again shortly.',
  };

  /**
   * Registry for localized messages by language code (e.g., 'en', 'es', 'fr').
   */
  private static readonly LOCALIZED_DICTIONARIES: Record<string, Record<ErrorCode, string>> = {
    en: ErrorMessageCatalog.MESSAGES_EN,
  };

  /**
   * Retrieves a sanitized, actionable message for a given error code and locale.
   * Defaults to English ('en') if locale is not provided or translations are missing.
   */
  static getMessage(code: ErrorCode, locale = 'en'): string {
    const dictionary = this.LOCALIZED_DICTIONARIES[locale] || this.LOCALIZED_DICTIONARIES['en'];
    return (
      dictionary[code] ||
      this.MESSAGES_EN[code] ||
      'An unexpected error occurred. Please try again later.'
    );
  }

  /**
   * Registers or extends translations for a specific locale.
   */
  static registerLocale(locale: string, messages: Partial<Record<ErrorCode, string>>): void {
    this.LOCALIZED_DICTIONARIES[locale] = {
      ...(this.LOCALIZED_DICTIONARIES[locale] || this.MESSAGES_EN),
      ...messages,
    };
  }
}
