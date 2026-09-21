import { ArgumentsHost, HttpStatus, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from './all-exceptions.filter';
import {
  ErrorCode,
  ErrorMessageCatalog,
  InvalidCredentialsException,
  UserNotFoundException,
  EmailAlreadyExistsException,
} from '../errors';

describe('AllExceptionsFilter ("The Bouncer")', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'POST',
      url: '/api/auth/login',
      headers: {},
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('Domain Exceptions', () => {
    it('should format InvalidCredentialsException with status 401 and ERR_INVALID_CREDENTIALS', () => {
      const exception = new InvalidCredentialsException();
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.UNAUTHORIZED,
          errorCode: ErrorCode.ERR_INVALID_CREDENTIALS,
          message: ErrorMessageCatalog.getMessage(ErrorCode.ERR_INVALID_CREDENTIALS),
          details: null,
          path: '/api/auth/login',
        }),
      );
    });

    it('should format UserNotFoundException with status 404 and ERR_USER_NOT_FOUND', () => {
      const exception = new UserNotFoundException();
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.ERR_USER_NOT_FOUND,
          message: ErrorMessageCatalog.getMessage(ErrorCode.ERR_USER_NOT_FOUND),
        }),
      );
    });

    it('should format EmailAlreadyExistsException with status 409 and ERR_EMAIL_ALREADY_EXISTS', () => {
      const exception = new EmailAlreadyExistsException();
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.CONFLICT,
          errorCode: ErrorCode.ERR_EMAIL_ALREADY_EXISTS,
          message: ErrorMessageCatalog.getMessage(ErrorCode.ERR_EMAIL_ALREADY_EXISTS),
        }),
      );
    });
  });

  describe('ValidationPipe Errors', () => {
    it('should format ValidationPipe array errors into ERR_VALIDATION_FAILED with field details', () => {
      const validationException = new BadRequestException({
        message: ['email must be an email', 'password is too short'],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(validationException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.ERR_VALIDATION_FAILED,
          message: ErrorMessageCatalog.getMessage(ErrorCode.ERR_VALIDATION_FAILED),
          details: ['email must be an email', 'password is too short'],
        }),
      );
    });
  });

  describe('Database / Prisma Errors (Information Hiding)', () => {
    it('should sanitize P2002 unique constraint error and redact table / column names', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'], modelName: 'User' },
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      const responsePayload = mockResponse.json.mock.calls[0][0];

      expect(responsePayload.success).toBe(false);
      expect(responsePayload.statusCode).toBe(HttpStatus.CONFLICT);
      expect(responsePayload.errorCode).toBe(ErrorCode.ERR_RESOURCE_CONFLICT);
      expect(responsePayload.message).toBe(
        ErrorMessageCatalog.getMessage(ErrorCode.ERR_RESOURCE_CONFLICT),
      );

      // Verify no sensitive internal schema/table/field names leaked
      expect(JSON.stringify(responsePayload)).not.toContain('User');
      expect(JSON.stringify(responsePayload)).not.toContain('fields: (`email`)');
      expect(JSON.stringify(responsePayload)).not.toContain('P2002');
    });

    it('should sanitize P2025 record not found error and redact internal database details', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'An operation failed because it depends on one or more records that were required but not found. Record to update not found.',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      const responsePayload = mockResponse.json.mock.calls[0][0];

      expect(responsePayload.errorCode).toBe(ErrorCode.ERR_RESOURCE_NOT_FOUND);
      expect(responsePayload.message).toBe(
        ErrorMessageCatalog.getMessage(ErrorCode.ERR_RESOURCE_NOT_FOUND),
      );
      expect(JSON.stringify(responsePayload)).not.toContain('P2025');
    });

    it('should sanitize unknown Prisma database error into ERR_DATABASE_ERROR', () => {
      const prismaError = new Prisma.PrismaClientUnknownRequestError(
        'Database connection timeout at postgresql://user:secret@db:5432/main',
        { clientVersion: '5.0.0' },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const responsePayload = mockResponse.json.mock.calls[0][0];

      expect(responsePayload.errorCode).toBe(ErrorCode.ERR_DATABASE_ERROR);
      expect(responsePayload.message).toBe(
        ErrorMessageCatalog.getMessage(ErrorCode.ERR_DATABASE_ERROR),
      );
      // Strictly redact database credentials and hostnames
      expect(JSON.stringify(responsePayload)).not.toContain('user:secret');
      expect(JSON.stringify(responsePayload)).not.toContain('postgresql://');
    });
  });

  describe('Unhandled Generic Errors (Stack Trace Redaction)', () => {
    it('should sanitize unhandled runtime Error and NEVER leak stack traces or internal messages', () => {
      const unhandledError = new Error('CRITICAL: Segmentation fault / secret key leaked in /app/secret.pem');
      unhandledError.stack = 'Error: CRITICAL...\n    at AuthService.login (/app/src/modules/auth/auth.service.ts:45:13)';

      filter.catch(unhandledError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const responsePayload = mockResponse.json.mock.calls[0][0];

      expect(responsePayload.success).toBe(false);
      expect(responsePayload.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(responsePayload.errorCode).toBe(ErrorCode.ERR_INTERNAL_SERVER_ERROR);
      expect(responsePayload.message).toBe(
        ErrorMessageCatalog.getMessage(ErrorCode.ERR_INTERNAL_SERVER_ERROR),
      );
      expect(responsePayload.details).toBeNull();

      // Ensure absolutely NO stack trace or internal messages leak to client
      expect(JSON.stringify(responsePayload)).not.toContain('Segmentation fault');
      expect(JSON.stringify(responsePayload)).not.toContain('secret key');
      expect(JSON.stringify(responsePayload)).not.toContain('auth.service.ts');
      expect(JSON.stringify(responsePayload)).not.toContain('stack');
    });
  });
});
