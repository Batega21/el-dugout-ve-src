import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import {
  ErrorCode,
  ErrorMessageCatalog,
  DomainException,
  isDomainException,
} from '../errors';

/**
 * Global Exception Boundary Filter ("The Bouncer").
 * Intercepts all exceptions across controllers, guards, pipes, and services.
 * - Logs technical details and stack traces to secure server-side logs.
 * - Redacts internal architecture, database specifics, and stack traces from network responses.
 * - Enforces a standardized API Error Response contract.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract preferred language from Accept-Language for future i18n support
    const acceptLanguage = request.headers['accept-language'];
    const locale = acceptLanguage ? acceptLanguage.split(',')[0]?.split(';')[0]?.trim() : 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.ERR_INTERNAL_SERVER_ERROR;
    let message: string = ErrorMessageCatalog.getMessage(errorCode, locale);
    let details: any = null;
    let internalLogMessage = 'Unhandled internal server error';

    // 1. Semantic Domain Exceptions
    if (isDomainException(exception)) {
      status = exception.getStatus();
      errorCode = exception.errorCode;
      details = exception.details;

      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res && typeof (res as any).message === 'string') {
        message = (res as any).message;
      } else {
        message = ErrorMessageCatalog.getMessage(errorCode, locale);
      }
      internalLogMessage = `DomainException [${errorCode}]: ${message}`;
    }
    // 2. Prisma / Database Errors (NEVER leak schema, table names, or constraints)
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      internalLogMessage = `PrismaClientKnownRequestError [${exception.code}] on model '${exception.meta?.modelName || 'unknown'}': ${exception.message}`;

      switch (exception.code) {
        case 'P2002': // Unique constraint violation
          status = HttpStatus.CONFLICT;
          errorCode = ErrorCode.ERR_RESOURCE_CONFLICT;
          message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_RESOURCE_CONFLICT, locale);
          break;
        case 'P2025': // Record to update/delete not found
          status = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.ERR_RESOURCE_NOT_FOUND;
          message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_RESOURCE_NOT_FOUND, locale);
          break;
        case 'P2003': // Foreign key constraint violation
          status = HttpStatus.BAD_REQUEST;
          errorCode = ErrorCode.ERR_BAD_REQUEST;
          message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_BAD_REQUEST, locale);
          break;
        case 'P2022': // Column not found in schema (misconfiguration)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorCode = ErrorCode.ERR_DATABASE_ERROR;
          message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_DATABASE_ERROR, locale);
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorCode = ErrorCode.ERR_INTERNAL_SERVER_ERROR;
          message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_INTERNAL_SERVER_ERROR, locale);
          break;
      }
    } else if (
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ErrorCode.ERR_DATABASE_ERROR;
      message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_DATABASE_ERROR, locale);
      internalLogMessage = `Prisma Database Error: ${(exception as Error).message}`;
    }
    // 3. NestJS Built-in HTTP Exceptions (e.g. ValidationPipe, UnauthorizedException, etc.)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // Handle ValidationPipe errors
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        if (Array.isArray(resObj.message)) {
          errorCode = ErrorCode.ERR_VALIDATION_FAILED;
          message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_VALIDATION_FAILED, locale);
          details = resObj.message;
          internalLogMessage = `Validation failed: ${resObj.message.join(', ')}`;
        } else if (typeof resObj.message === 'string') {
          errorCode = this.mapHttpStatusToErrorCode(status);
          message = resObj.message;
          internalLogMessage = `HttpException [${status}]: ${resObj.message}`;
        } else {
          errorCode = this.mapHttpStatusToErrorCode(status);
          message = ErrorMessageCatalog.getMessage(errorCode, locale);
          internalLogMessage = `HttpException [${status}]: ${JSON.stringify(res)}`;
        }
      } else if (typeof res === 'string') {
        errorCode = this.mapHttpStatusToErrorCode(status);
        message = res;
        internalLogMessage = `HttpException [${status}]: ${res}`;
      } else {
        errorCode = this.mapHttpStatusToErrorCode(status);
        message = ErrorMessageCatalog.getMessage(errorCode, locale);
        internalLogMessage = `HttpException [${status}]`;
      }
    }
    // 4. Generic Unknown Errors (strictly sanitize to prevent information leakage)
    else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ErrorCode.ERR_INTERNAL_SERVER_ERROR;
      message = ErrorMessageCatalog.getMessage(ErrorCode.ERR_INTERNAL_SERVER_ERROR, locale);
      internalLogMessage = `Unhandled Error: ${exception.message}`;
    }

    // Secure Server-side Logging (stack traces stay on the server)
    const logDetails = `[${request.method}] ${request.url} - Status: ${status} (${errorCode}) - ${internalLogMessage}`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        logDetails,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(logDetails);
    }

    // Standardized API Error Response Payload
    const errorResponse = {
      success: false,
      statusCode: status,
      errorCode,
      message,
      details: details ?? null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Helper to map standard HTTP status codes to standardized error codes.
   */
  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.ERR_BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.ERR_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.ERR_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.ERR_RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.ERR_RESOURCE_CONFLICT;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.ERR_SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.ERR_INTERNAL_SERVER_ERROR;
    }
  }
}
