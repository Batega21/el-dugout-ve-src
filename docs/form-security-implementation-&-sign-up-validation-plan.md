# Form Security Implementation & Sign-Up Validation Plan

This plan implements the security enhancements identified in the form security evaluation and resolves the password mismatch error display issue in [`sign-up-dialog.component.ts`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/sign-up-dialog/sign-up-dialog.component.ts).

## User Review Required

> [!IMPORTANT]
> **Rate Limiting Defaults**:
> - Global rate limit: 60 requests per minute per IP.
> - Authentication rate limit (`/api/auth/login` and `/api/auth/register`): 5 attempts per minute per IP to prevent brute-force attacks and credential stuffing.
> Please let us know if you prefer different thresholds for your development or testing environment.

> [!NOTE]
> **CAPTCHA Integration**:
> Turnstile (Cloudflare) or reCAPTCHA v3 requires third-party API site and secret keys. In this plan, rate limiting is implemented immediately at the application layer. CAPTCHA can be added as a subsequent step once external provider keys are provisioned.

---

## Proposed Changes

### Frontend (`frontend/`)

#### [MODIFY] [sign-up-dialog.component.ts](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/sign-up-dialog/sign-up-dialog.component.ts)
- Import `ErrorStateMatcher` from `@angular/material/core`.
- Implement `ConfirmPasswordErrorStateMatcher` which triggers the error state if:
  - The control is dirty or touched, AND
  - The parent form or control has `passwordMismatch`.
- Bind `[errorStateMatcher]="confirmPasswordMatcher"` on the `confirmPassword` input field.
- Update the `@if` template check on line 185 to check `(signUpForm.controls.confirmPassword.dirty || signUpForm.controls.confirmPassword.touched)` so users receive immediate visual feedback when mismatched.

#### [MODIFY] [sign-up-dialog.component.spec.ts](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/sign-up-dialog/sign-up-dialog.component.spec.ts)
- Add unit test verifying that `confirmPasswordMatcher.isErrorState` returns true when passwords differ and the field is dirty or touched.

---

### Backend (`backend/`)

#### [MODIFY] [package.json](file:///Users/gabo/repos/el-dugout/backend/package.json)
- Add `helmet` (and `@types/helmet` in devDependencies).
- Add `@nestjs/throttler` for IP-based rate limiting.

#### [MODIFY] [app.module.ts](file:///Users/gabo/repos/el-dugout/backend/src/app.module.ts)
- Import `ThrottlerModule` and `ThrottlerGuard`.
- Configure `ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])`.
- Bind `ThrottlerGuard` as a global provider via `APP_GUARD`.

#### [MODIFY] [main.ts](file:///Users/gabo/repos/el-dugout/backend/src/main.ts)
- Import and register `helmet()` middleware with Swagger UI-friendly CSP configuration (`crossOriginEmbedderPolicy: false` to ensure Swagger UI stylesheets and scripts load cleanly).
- Tighten CORS origin evaluation to avoid reflecting `origin: true` if `CORS_ORIGINS` is configured with wildcard and credentials.

#### [MODIFY] [auth.controller.ts](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/auth.controller.ts)
- Add `@Throttle({ default: { limit: 5, ttl: 60000 } })` to `/api/auth/login` and `/api/auth/register` to prevent brute force and credential stuffing.

#### [MODIFY] [register.dto.ts](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/dto/register.dto.ts) & [login.dto.ts](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/dto/login.dto.ts)
- Add `@MaxLength(50)` for first/last names.
- Add `@MaxLength(255)` for email addresses.
- Add `@MaxLength(72)` for passwords (preventing bcrypt compute exhaustion / ReDoS).
- Add `@MaxLength(20)` for mobile numbers.

#### [MODIFY] [create-user.dto.ts](file:///Users/gabo/repos/el-dugout/backend/src/modules/users/dto/create-user.dto.ts) & [update-profile.dto.ts](file:///Users/gabo/repos/el-dugout/backend/src/modules/auth/dto/update-profile.dto.ts)
- Add `@MaxLength` constraints consistent with database schema lengths.

---

## Verification Plan

### Automated Tests
- Backend Unit Tests:
  ```bash
  cd backend && npm test
  ```
- Backend Build:
  ```bash
  cd backend && npm run build
  ```
- Frontend Unit Tests:
  ```bash
  cd frontend && npm run test:unit
  ```
- Frontend Build:
  ```bash
  cd frontend && npm run build
  ```

### Manual Verification
1. **Password Mismatch**: Open the sign-up dialog in the browser, type `abc123@abi` in Password and `abc123@nat` in Confirm Password; verify the field turns red and `<mat-error>Passwords do not match</mat-error>` displays.
2. **Rate Limiting**: Submit more than 5 login/registration attempts within 1 minute; verify HTTP `429 Too Many Requests` is returned.
3. **Security Headers**: Inspect HTTP response headers in network tab for `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and CSP.
4. **Input Constraints**: Verify payloads exceeding max-lengths receive clean `400 Bad Request` validation errors.
