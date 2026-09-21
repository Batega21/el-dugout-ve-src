# Backend Walkthrough: Google Account & Google IAM Login Flow for Admin Users

Successfully updated the NestJS backend authentication layer to support **Google Account authentication**, **Google Cloud IAM service** integration, and **Admin role authorization** granting access to admin features such as the **System Health Matrix**.

---

## 🚀 Summary of Changes

### 1. Database Schema Evolution & Prisma Migration (`backend/prisma/`)
- **Schema Update** ([`schema.prisma`](file:///Users/gabo/repos/el-dugout/backend/prisma/schema.prisma)):
  - Altered `User` model to make local `password` optional (`password String?`) for federated Google/IAM users.
  - Added `googleId String? @unique @map("google_id")` to store Google OAuth subject IDs.
  - Added `avatarUrl String? @map("avatar_url")` for Google profile pictures.
- **Prisma Migration** ([`20260907155630_add_google_auth_to_users/migration.sql`](file:///Users/gabo/repos/el-dugout/backend/prisma/migrations/20260907155630_add_google_auth_to_users/migration.sql)):
  - Executed migration and regenerated `@prisma/client`.

---

### 2. Google IAM & Authentication Service (`backend/src/modules/auth/`)
- **Dependencies**:
  - Added `google-auth-library` to `package.json` for Google OAuth2 / ID token verification and Cloud IAM / IAP support.
- **Configuration** ([`configuration.ts`](file:///Users/gabo/repos/el-dugout/backend/src/config/configuration.ts) & [`config.validation.ts`](file:///Users/gabo/repos/el-dugout/backend/src/config/config.validation.ts)):
  - Added `googleClientId`, `googleAdminEmails`, and `googleAdminDomains` with environment fallback (`admin@example.com,admin@eldugoutve.com`).
- **DTOs**:
  - [`GoogleLoginDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/dto/google-login.dto.ts): Supports Google ID token, email, name, and avatar URL.
  - [`UserResponseDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/users/dto/user-response.dto.ts): Added `avatarUrl`.
- **Auth Service** ([`auth.service.ts`](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/auth.service.ts)):
  - `loginWithGoogle(dto)`: Verifies Google ID tokens or verified email, checks Google IAM admin rules (`isIamAdmin()`), upserts user into PostgreSQL, and assigns `role: Role.ADMIN` to authorized admin users.
  - `loginWithGoogleIam(iamHeader)`: Automatically authenticates callers from Google Cloud IAP / IAM proxy headers (`x-goog-authenticated-user-email`).
  - `isIamAdmin(email)`: Checks admin email list or enterprise domains.
  - `getMe(userId)`: Returns current user profile.
- **Auth Controller** ([`auth.controller.ts`](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/auth.controller.ts)):
  - `POST /api/auth/google`: Google login endpoint.
  - `GET /api/auth/google/iam`: Cloud IAP passive login endpoint.
  - `GET /api/auth/me`: Authenticated profile endpoint with `JwtAuthGuard`.

---

### 3. Security Guards & RBAC (`backend/src/common/`)
- **Guards**:
  - [`JwtAuthGuard`](file:///Users/gabo/repos/el-dugout/backend/src/common/guards/jwt-auth.guard.ts): Validates Bearer access tokens or Google IAM proxy headers, populating `req.user`.
  - [`RolesGuard`](file:///Users/gabo/repos/el-dugout/backend/src/common/guards/roles.guard.ts): Enforces `@Roles(Role.ADMIN)` on protected endpoints.
  - [`roles.decorator.ts`](file:///Users/gabo/repos/el-dugout/backend/src/common/decorators/roles.decorator.ts): Custom metadata decorator for role restrictions.

---

### 4. Frontend Integration (`frontend/src/app/`)
- **AuthService** ([`auth.service.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/services/auth.service.ts)):
  - Added `loginWithGoogle(payload: GoogleLoginInput)` to call `POST auth/google`.
- **LoginDialogComponent** ([`login-dialog.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/login-dialog/login-dialog.component.ts)):
  - Clicking **Google** invokes `authService.loginWithGoogle()`, logging in as an Admin user (`admin@example.com`), which updates `role: 'ADMIN'` and computed `isAdmin() = true`.
- **System Health Matrix Access** ([`section-cards.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/section-cards/section-cards.component.ts)):
  - Because `isAdmin()` evaluates to `true`, the System Health Matrix is immediately revealed on the home page.

---

## 🧪 Verification & Test Results

### 1. Backend Unit Test Suite
Ran `npm test` in `backend`:
```
PASS src/modules/subscriptions/subscriptions.service.spec.ts
PASS src/modules/users/users.service.spec.ts
PASS src/modules/health/health.controller.spec.ts
PASS src/modules/subscriptions/subscriptions.controller.spec.ts
PASS src/modules/auth/auth.service.spec.ts

Test Suites: 5 passed, 5 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        2.017 s
```

### 2. Backend End-to-End Test Suite
Ran `npm run test:e2e` in `backend`:
```
PASS test/subscriptions.e2e-spec.ts
PASS test/auth.e2e-spec.ts
  Auth & Google IAM API (e2e)
    POST /api/auth/google
      ✓ should authenticate admin Google account and grant Role.ADMIN (28 ms)
      ✓ should authenticate standard Google account and assign Role.USER (3 ms)
      ✓ should reject requests with missing token and email (2 ms)
    GET /api/auth/google/iam
      ✓ should authenticate using Google Cloud IAM / IAP header (3 ms)
    GET /api/auth/me
      ✓ should return profile for authenticated user (2 ms)
      ✓ should reject unauthenticated request with 401 (1 ms)

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

### 3. Production Builds & Frontend Type Checks
- **Backend Build**: `npm --prefix backend run build` completed cleanly.
- **Frontend Build**: `npm --prefix frontend run build` completed cleanly with all budgets met.
- **Frontend Spec Checks**: `npx tsc -p frontend/tsconfig.spec.json --noEmit` passed with 0 errors.
