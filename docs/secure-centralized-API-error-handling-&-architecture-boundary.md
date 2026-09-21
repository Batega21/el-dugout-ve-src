# Secure Centralized API Error Handling & Architecture Boundary

We have implemented a defense-in-depth API error-handling architecture that hides backend internals, database schemas, and stack traces from the frontend while standardizing error payloads and centralizing actionable user-facing messages.

---

## 🛡️ Key Architectural Pillars Implemented

### 1. Centralized Error Catalog & Dictionary (`ErrorCode` & `ErrorMessageCatalog`)
- **Location**: [`error-codes.enum.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/error-codes.enum.ts) and [`error-messages.catalog.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/error-messages.catalog.ts)
- Defined unique constant string error codes (`ERR_INVALID_CREDENTIALS`, `ERR_ACCOUNT_INACTIVE`, `ERR_USER_NOT_FOUND`, `ERR_VALIDATION_FAILED`, `ERR_RESOURCE_CONFLICT`, `ERR_DATABASE_ERROR`, `ERR_INTERNAL_SERVER_ERROR`, etc.).
- Centralized dictionary providing actionable human-readable messages stating **what went wrong** and **how the user can resolve it**.
- Localization (i18n) ready with support for `Accept-Language` headers and multi-locale dictionary registration (`ErrorMessageCatalog.registerLocale`).

### 2. Strict Separation of Concerns via Domain Exceptions
- **Location**: [`domain-exceptions.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/domain-exceptions.ts)
- Business services throw semantic domain exceptions instead of ad-hoc HTTP errors or raw strings:
  - `InvalidCredentialsException`
  - `AccountInactiveException`
  - `EmailAlreadyExistsException`
  - `UserNotFoundException`
  - `ResourceNotFoundException`
  - `InsufficientPermissionsException`
  - `SubscriptionTierRequiredException`
  - `InvalidTokenException`
- Updated `AuthService`, `UsersService`, `SubscriptionsService`, `RolesGuard`, `SubscriptionGuard`, and `JwtAuthGuard` to throw these domain errors.

### 3. Global Exception Boundary ("The Bouncer")
- **Location**: [`all-exceptions.filter.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/filters/all-exceptions.filter.ts)
- Catches all exceptions at the API edge (`@Catch()`):
  - **Domain Exceptions**: Maps to registered HTTP status codes and actionable messages.
  - **Prisma Database Errors**: Catches constraint errors (e.g., `P2002` unique constraint, `P2025` not found) and redacts table names, SQL constraints, and connection strings from the network response.
  - **Validation Errors**: Translates `ValidationPipe` errors into `ERR_VALIDATION_FAILED` with structured field-level feedback.
  - **Unhandled Errors**: Returns a safe 500 `ERR_INTERNAL_SERVER_ERROR`. **Stack traces, file paths, and internal messages are strictly kept on the server logs** and NEVER emitted to the client.

### 4. Standardized API Error Response Contract
- **DTO**: [`api-error-response.dto.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/dto/api-error-response.dto.ts)
- **Frontend Model**: [`api-error.model.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/models/api-error.model.ts)
- Predictable contract format:
  ```json
  {
    "success": false,
    "statusCode": 401,
    "errorCode": "ERR_INVALID_CREDENTIALS",
    "message": "The email or password you entered is incorrect. Please verify your credentials and try again.",
    "details": null,
    "timestamp": "2026-09-12T12:00:00.000Z",
    "path": "/api/auth/login"
  }
  ```
- Retains backward compatibility with existing frontend error handling (`err?.error?.message`) while unlocking code-driven UI triggers (e.g. `err.error?.errorCode === ErrorCode.ERR_INVALID_CREDENTIALS`).

---

## 🧪 Verification & Test Results

### Automated Backend Tests
Ran all unit test suites in `backend`:
```bash
npm test
```
Result:
```text
PASS src/common/filters/all-exceptions.filter.spec.ts
PASS src/modules/subscriptions/subscriptions.service.spec.ts
PASS src/modules/users/users.service.spec.ts
PASS src/modules/health/health.controller.spec.ts
PASS src/modules/subscriptions/subscriptions.controller.spec.ts
PASS src/modules/auth/auth.service.spec.ts

Test Suites: 6 passed, 6 total
Tests:       44 passed, 44 total
Snapshots:   0 total
Time:        2.826 s
```

### TypeScript Compilation & Builds
1. **Backend Build**:
   ```bash
   cd backend && npm run build
   # Exit code 0 (nest build succeeded)
   ```
2. **Frontend Type Check**:
   ```bash
   cd frontend && npx tsc -p tsconfig.app.json --noEmit
   # Exit code 0 (0 errors)
   ```

---

## 📁 Modified & Created Files Summary

| Component | File | Action | Purpose |
|---|---|---|---|
| **Backend Errors** | [`error-codes.enum.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/error-codes.enum.ts) | Created | Constant machine-readable error codes |
| **Backend Errors** | [`error-messages.catalog.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/error-messages.catalog.ts) | Created | Centralized dictionary of actionable user messages with i18n support |
| **Backend Errors** | [`domain-exceptions.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/domain-exceptions.ts) | Created | Semantic domain exceptions for business services |
| **Backend Errors** | [`api-error-response.dto.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/dto/api-error-response.dto.ts) | Created | Swagger OpenAPI-documented error response contract |
| **Backend Errors** | [`index.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/errors/index.ts) | Created | Barrel export for error module |
| **Backend Filter** | [`all-exceptions.filter.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/filters/all-exceptions.filter.ts) | Modified | Global bouncer sanitizing responses & logging diagnostics |
| **Backend Tests** | [`all-exceptions.filter.spec.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/filters/all-exceptions.filter.spec.ts) | Created | Unit test suite verifying stack trace redaction & Prisma sanitization |
| **Backend Services** | [`auth.service.ts`](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/auth.service.ts), [`users.service.ts`](file:///Users/gabo/repos/el-dugout/backend/src/modules/users/users.service.ts), [`subscriptions.service.ts`](file:///Users/gabo/repos/el-dugout/backend/src/modules/subscriptions/subscriptions.service.ts) | Modified | Throws semantic domain exceptions |
| **Backend Guards** | [`roles.guard.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/guards/roles.guard.ts), [`subscription.guard.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/guards/subscription.guard.ts), [`jwt-auth.guard.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/guards/jwt-auth.guard.ts) | Modified | Uses domain exceptions for authorization/entitlement failures |
| **Frontend Core** | [`api-error.model.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/models/api-error.model.ts) | Created | Frontend interface, enum, and error extraction utility |
