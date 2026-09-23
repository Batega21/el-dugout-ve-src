# Walkthrough: Secure Excel File Import & Validation Flow

We have implemented an end-to-end admin data ingestion feature for **El Dugout VE**, enabling administrators to upload Excel spreadsheets (`.xlsx`, `.xls`), perform strict client- and server-side threat mitigations, inspect parsed rows in a validation table with database duplicate conflict detection, and atomically commit clean records into PostgreSQL.

---

## Changes Summary

### 1. Backend Security & Processing (NestJS 10+)
- **Binary Signature & Magic Number Inspection (`validateMagicNumber`):**
  - Verifies the first 4 bytes of uploaded files directly from buffer.
  - Accepts authentic ZIP/XLSX (`50 4B 03 04`) and legacy OLE2/XLS (`D0 CF 11 E0`).
  - Blocks disguised or executable payloads (e.g., `4D 5A` MZ header).
- **Anti-Formula / CSV Injection Sanitization (`sanitizeFormula`):**
  - Sanitizes cell values starting with dangerous characters (`=`, `+`, `-`, `@`, `\t`, `\r`) by prepending a single quote (`'`), neutralizing spreadsheet formula execution.
- **Structure & Column Schema Validation (`validateRequiredHeaders`):**
  - Requires season (`Año/Temporada`), player (`Jugador/Bateador`), and team (`Equipo`), plus category-specific metric columns (`AVG`, `HR`, `2B`, `3B`, `H`, `CA`, `IP`).
- **Two-Step API Endpoints in [`ImportsController`](file:///Users/gabo/repos/el-dugout/backend/src/modules/imports/imports.controller.ts):**
  - `POST /api/v1/imports/preview` (or `/api/imports/preview`):
    - Accepts multipart/form-data (up to 8 MB).
    - Performs database dry-run check to flag existing records as `DUPLICATE`.
    - Returns [`ValidationPreviewDto`](file:///Users/gabo/repos/el-dugout/backend/src/modules/imports/dto/validation-preview.dto.ts) with row statuses (`VALID`, `DUPLICATE`, `ERROR`).
  - `POST /api/v1/imports/commit` (or `/api/imports/commit`):
    - Commits validated rows inside a single atomic ACID transaction (`this.prisma.$transaction(...)`).
    - Upserts `Season`, `Player` (slug deduplication), resolves canonical `Team`, and upserts `SeasonLeader`.
    - Rolls back cleanly if any failure occurs.
- **Module Registration:**
  - Encapsulated within [`ImportsModule`](file:///Users/gabo/repos/el-dugout/backend/src/modules/imports/imports.module.ts) and registered in [`AppModule`](file:///Users/gabo/repos/el-dugout/backend/src/app.module.ts).

### 2. Frontend Architecture (Angular 19+)
- **Security Service [`ImportsService`](file:///Users/gabo/repos/el-dugout/frontend/src/app/core/services/imports.service.ts):**
  - Implements `verifyFileMagicNumber(file)` using browser `ArrayBuffer` slice before upload.
  - Integrates HTTP calls for `previewFile` and `commitImport`.
- **Upload Component [`ImportFileComponent`](file:///Users/gabo/repos/el-dugout/frontend/src/app/modules/admin/components/import-file/import-file.component.ts):**
  - Modern sports-tech dark aesthetic (`#0a0a0c`, `#111827`, border `#1f2937`, primary red `#e52323`).
  - Drag-and-drop dropzone with active drag-over states and file input fallback.
  - Angular Material `<mat-progress-spinner>` displayed during server validation and commit.
  - Role-protected: inaccessible to non-admins (both via `adminGuard` and template fallback).
- **Preview Table [`ValidationTableComponent`](file:///Users/gabo/repos/el-dugout/frontend/src/app/modules/admin/components/validation-table/validation-table.component.ts):**
  - Summary cards: Total rows, Valid rows (Green badge), Duplicated rows / Conflict with DB (Orange badge), Malformed rows (Red badge).
  - Responsive data table highlighting duplicate and error rows.
  - Action buttons: "Confirmar y Guardar en Base de Datos" and "Descartar / Cancelar".
- **Legacy Architecture Cleanup:**
  - Removed obsolete `ArchitectureComponent` and `/architecture` route.
  - Removed outdated placeholder `leaderboard-import.component.ts`.
  - Updated [`NavMenuComponent`](file:///Users/gabo/repos/el-dugout/frontend/src/app/shared/components/header/nav-menu/nav-menu.component.ts) to provide the "Importar Excel" option strictly to admin users.
- **Internationalization (i18n):**
  - Complete dictionaries added to [`es.json`](file:///Users/gabo/repos/el-dugout/frontend/public/assets/i18n/es.json) and [`en.json`](file:///Users/gabo/repos/el-dugout/frontend/public/assets/i18n/en.json) under `IMPORT_EXCEL.*` and `COMMON.NAV.IMPORT_EXCEL`.

---

## Verification Results

### 1. Backend Unit Tests (`npm test`)
```text
PASS src/modules/subscriptions/subscriptions.service.spec.ts
PASS src/common/filters/all-exceptions.filter.spec.ts
PASS src/modules/health/health.controller.spec.ts
PASS src/modules/users/users.service.spec.ts
PASS src/modules/subscriptions/subscriptions.controller.spec.ts
PASS src/modules/leaderboards/leaderboard-import.service.spec.ts
PASS src/modules/imports/imports.controller.spec.ts
PASS src/modules/leaderboards/leaderboards.controller.spec.ts
PASS src/modules/auth/auth.service.spec.ts

Test Suites: 9 passed, 9 total
Tests:       89 passed, 89 total
Snapshots:   0 total
Time:        7.684 s
```

### 2. Frontend Unit Tests (`npm test` / Vitest)
```text
 ✓ src/app/modules/admin/components/validation-table/validation-table.component.spec.ts (6 tests)
 ✓ src/app/modules/admin/components/import-file/import-file.component.spec.ts (9 tests)
 ✓ src/app/core/services/imports.service.spec.ts (7 tests)
 ...
 Test Files  22 passed (22)
      Tests  160 passed (160)
   Duration  3.68s
```

### 3. Build & Compilation Verification
- **Backend Build:** `npm run build` completed successfully (`nest build`).
- **Frontend Type Checking:** `npx tsc -p tsconfig.app.json --noEmit` completed with 0 errors.
