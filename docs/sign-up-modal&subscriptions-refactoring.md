# Walkthrough: Sign Up Modal Feature & Subscriptions Refactoring

We have completed the implementation of **Task 1: Sign Up Feature** and **Task 2: User-Subscribed Decoupling & 1:1 Database Schema Alignment**.

---

## 🚀 Key Changes Overview

### 1. Database Schema & Prisma ORM (`backend/prisma/`)

- **`User` Model**:
  - Added `firstName` (`first_name`), `lastName` (`last_name`), and optional `mobileNumber` (`mobile_number`).
  - Removed deprecated `name` column.
  - Linked to `Subscription?` as a strict 1:1 relation.
- **`Subscription` Model**:
  - Removed duplicate personal data fields (`firstName`, `lastName`, `email`, `mobile`).
  - Retained billing/subscription fields: `id`, `plan`, `billingPeriod`, `renewalConsent`, `termsAccepted`, `status`, `userId`, `createdAt`, `updatedAt`.
  - Added `@unique` on `userId` (`user_id`) to enforce strict 1:1 relationship with `User` (`onDelete: Cascade`).
- **Migration & Seeding**:
  - Generated migration SQL in [`backend/prisma/migrations/20260908120500_update_users_and_subscriptions_1to1/migration.sql`](file:///Users/gabo/repos/el-dugout/backend/prisma/migrations/20260908120500_update_users_and_subscriptions_1to1/migration.sql).
  - Updated [`backend/prisma/seed.ts`](file:///Users/gabo/repos/el-dugout/backend/prisma/seed.ts) with `firstName`, `lastName`, `mobileNumber`, and 1:1 subscription seeding.
  - Ran `prisma generate` to update `@prisma/client`.

---

### 2. Backend NestJS REST API (`backend/src/`)

- **Authentication (`auth/`)**:
  - [`RegisterDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/dto/register.dto.ts): Added required `firstName`, `lastName`, and optional `mobileNumber` (`@Matches(/^[0-9-]*$/)`).
  - [`AuthService`](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/auth.service.ts): Updated `register()` to store first/last name and mobile number, and automatically log the new user in by issuing a JWT access token and user payload.
- **Subscriptions (`subscriptions/`)**:
  - [`CreateSubscriptionDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/subscriptions/dto/create-subscription.dto.ts): Removed customer information fields; retains only `plan`, `billingPeriod`, `renewalConsent`, and `termsAccepted`.
  - [`SubscriptionsController`](file:///Users/gabo/repos/el-dugout/backend/src/modules/subscriptions/subscriptions.controller.ts): Protected `POST /api/subscriptions` with `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`, associating the subscription with the authenticated `req.user.id`.
  - [`SubscriptionsService`](file:///Users/gabo/repos/el-dugout/backend/src/modules/subscriptions/subscriptions.service.ts): Refactored `create(userId, dto)` to use `prisma.subscription.upsert({ where: { userId } })` for idempotent 1:1 management, and included `user` relations in queries.
- **Users (`users/`)**:
  - Updated [`CreateUserDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/users/dto/create-user.dto.ts), [`UpdateUserDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/users/dto/update-user.dto.ts), [`UserResponseDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/users/dto/user-response.dto.ts), and [`bootstrap-admin.ts`](file:///Users/gabo/repos/el-dugout/backend/src/scripts/bootstrap-admin.ts).

---

### 3. Frontend Angular (`frontend/src/`)

- **Models & Auth Service (`core/`)**:
  - [`user.model.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/models/user.model.ts): Updated `User`, `CreateUserInput`, `RegisterInput` with `firstName`, `lastName`, and `mobileNumber`.
  - [`subscription.model.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/models/subscription.model.ts): Cleaned `CreateSubscriptionInput` and `Subscription` to point to `userId` and `user`.
  - [`auth.service.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/services/auth.service.ts): Updated `register()` signature and payload handling.
- **New Sign Up Dialog (`SignUpDialogComponent`)**:
  - Created [`sign-up-dialog.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/sign-up-dialog/sign-up-dialog.component.ts).
  - Form fields: First Name, Last Name, Email, Password (with toggle show/hide), Confirm Password (with toggle show/hide and cross-field match validation), Mobile Number (optional, strictly restricted to numbers and `-` via keydown interception, paste sanitization, and regex validation).
  - Social login buttons for Google, GitHub, and Apple.
  - "Already have an account? Sign in" clickable text that closes Sign Up and opens the Login modal.
  - Automatically logs the user in upon successful registration.
- **Refactored Subscription Dialog (`SubscriptionDialogComponent`)**:
  - Modified [`subscription-dialog.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/subscription-dialog/subscription-dialog.component.ts).
  - Removed "1. Account Information" and social login; now strictly focused on Plan Selection (Free / Premium), Billing Frequency (Monthly / Annual), and Terms & Disclosures.
- **Navigation & Workflow Wiring**:
  - [`nav-menu.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/header/nav-menu/nav-menu.component.ts): Clicking "Sign up" button now directly opens `SignUpDialogComponent`.
  - [`login-dialog.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/login-dialog/login-dialog.component.ts): Updated "Don't have an account? Create one" link to open `SignUpDialogComponent`.
  - [`home.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/features/home/home.component.ts): Clicking the hero "Subscribe Now" button checks authentication status:
    - If unauthenticated: Opens `SignUpDialogComponent`, and upon successful registration opens `SubscriptionDialogComponent`.
    - If authenticated: Directly opens `SubscriptionDialogComponent`.
  - [`admin-dashboard.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/features/admin/admin-dashboard.component.ts): Updated subscriber table to display user name and email from `sub.user`.

---

## 🧪 Verification & Results

### Automated Tests

1. **Backend Unit Tests**:
   - Command: `npm test` in `backend/`
   - Result: **5 test suites passed, 36 unit tests passed (100%)**

   ```text
   PASS src/modules/subscriptions/subscriptions.service.spec.ts
   PASS src/modules/users/users.service.spec.ts
   PASS src/modules/health/health.controller.spec.ts
   PASS src/modules/subscriptions/subscriptions.controller.spec.ts
   PASS src/modules/auth/auth.service.spec.ts

   Test Suites: 5 passed, 5 total
   Tests:       36 passed, 36 total
   ```

2. **Frontend Unit Tests**:
   - Command: `npm run test:unit` in `frontend/`
   - Result: **5 test suites passed, 41 unit tests passed (100%)**

   ```text
   ✓ src/app/core/services/auth.service.spec.ts (7 tests)
   ✓ src/app/core/guards/guards.spec.ts (8 tests)
   ✓ src/app/shared/components/subscription-dialog/subscription-dialog.component.spec.ts (8 tests)
   ✓ src/app/shared/components/login-dialog/login-dialog.component.spec.ts (7 tests)
   ✓ src/app/shared/components/sign-up-dialog/sign-up-dialog.component.spec.ts (11 tests)

   Test Files  5 passed (5)
   Tests       41 passed (41)
   ```

3. **Production Builds**:
   - Backend: `npm run build` in `backend/` -> **Clean compile (exit code 0)**.
   - Frontend: `npm run build` in `frontend/` -> **Clean compile (exit code 0)**.
