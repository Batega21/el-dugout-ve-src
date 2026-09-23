# TASK: Implement Secure Excel File Import & Validation Flow (Angular + NestJS)

## Context & Objective

Build an end-to-end admin data ingestion feature for "El Dugout VE". The workflow allows admin users to upload an Excel file (`.xlsx`, `.xls`), perform strict client and server-side security checks, view a parsed preview in a validation table (`ValidationTableComponent`) with duplication and integrity status, and finally commit the clean records into the existing PostgreSQL database via `imports.controller.ts` and `leaderboard-import.service.ts`.

---

## 1. Security Architecture & Threat Mitigation

### Client-Side Security:

- **Extension & MIME-Type Check:** Accept strictly `.xlsx` (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) and legacy `.xls` (`application/vnd.ms-excel`). Reject any other format.
- **Magic Number (Binary Signature) Check:** Read the first 4 bytes of the uploaded file before transmission. Ensure it matches the ZIP container signature (`50 4B 03 04` / `PK..`) for `.xlsx`. Immediately reject executable masquerading files.
- **File Size Constraint:** Hard limit of max 8 MB to protect against client/server memory exhaustion (Zip-Bomb/DoS).

### Server-Side Security (NestJS - `imports.controller.ts` & Services):

- Re-validate MIME types, file size, and buffer headers using Multer with memory storage.
- **Formula Injection / CSV Injection Sanitization:** Strip or escape any cell string value starting with `=`, `+`, `-`, `@`, `\t`, `\r` to prevent command execution if re-exported.
- Structure validation: Ensure required columns exist (e.g., `Temporada/Año`, `Jugador`, `Equipo`, etc.). Reject payload with clear HTTP 400 and structured error feedback if headers or data types are invalid.

---

## 2. Frontend Implementation (Angular)

### A. Role-Based Visibility

- Ensure the import module/route is protected by an `AdminGuard`.
- Only render the upload interface if the authenticated user has `role === 'admin'`.

### B. Component: `ImportFileComponent` (`src/app/modules/admin/components/import-file/`)

- **UI & Layout:**
  - Modern sports-tech dark mode aesthetic matching design tokens (`#0a0a0c`, `#111827`, border `#1f2937`, primary red `#e52323`).
  - **Drag-and-Drop Area:** Interactive dropzone with active drag-over states, visual dashed border, and upload icon.
  - Standard file browser fallback via hidden `<input type="file" #fileInput accept=".xlsx, .xls">`.
- **States & Interactivity (Angular Signals):**
  - `file = signal<File | null>(null)`
  - `isValidating = signal<boolean>(false)`
  - `isUploading = signal<boolean>(false)`
  - `errorMessage = signal<string | null>(null)`
  - `previewData = signal<ValidationPreviewDto | null>(null)`
- **Loading State:**
  - Display Angular Material `<mat-progress-spinner mode="indeterminate" diameter="48">` during server-side file parsing and database dry-run checks.
- **Action Buttons:**
  - "Validar archivo" / "Importar" button: Disabled until a safe, validated file is selected.

### C. Component: `ValidationTableComponent` (`src/app/modules/admin/components/validation-table/`)

- Renders after successful file parsing and server validation response.
- **Summary Cards / Badges:**
  - Total rows detected.
  - Valid rows (Green).
  - Duplicated rows / Conflict with existing DB records (Orange/Red badge).
  - Malformed or invalid rows.
- **Data Table:**
  - Responsive table showing row number, player name, team, season, metrics, and validation status (`VALID`, `DUPLICATE`, `ERROR`).
  - Highlight conflicted rows so the admin can clearly identify existing records.
- **Commit Actions:**
  - **"Confirmar y Guardar en Base de Datos"** (Primary Red Button) -> Calls execution endpoint.
  - **"Descartar / Cancelar"** (Ghost Button) -> Resets form and returns to upload dropzone.

---

## 3. Backend Alignment (`imports.controller.ts` & `leaderboard-import.service.ts`)

Ensure endpoints support the 2-step validation & commit flow:
1. `POST /api/v1/imports/preview` (or `dryRun: true` flag):
   - Accepts multipart/form-data.
   - Parses Excel buffer using `exceljs` or `xlsx`.
   - Checks existing database records for duplicate player/season/team entries.
   - Returns `{ summary: { total, valid, duplicates, errors }, rows: [...] }` without committing DB transactions.
2. `POST /api/v1/imports/commit`:
   - Commits the validated dataset into the target PostgreSQL tables inside an ACID transaction (`runner.startTransaction()`).
   - If any step fails, roll back cleanly and return meaningful error details.

---

## 4. Internationalization & Feedback

- Hook all UI labels, button texts, error messages, and table headers to the i18n dictionary (`es.json` & `en.json`) using `translate` pipe.
- Show localized alerts for:
  - Invalid file type / Security breach attempt.
  - File exceeds size limit.
  - Missing required columns in spreadsheet.
  - Successful import confirmation.

---

## Acceptance Criteria

- [ ] Remove completely the old architecture component.
- [ ] Update the nav-menu navigation with Excel Import option for admin users.
- [ ] Non-admin users cannot see or access the component.
- [ ] Drag-and-drop and file input reject non-Excel files immediately with magic number verification.
- [ ] Angular Material spinner is visible during server processing.
- [ ] Validation table clearly flags duplicate records against the current database state.
- [ ] Final commit successfully writes data to PostgreSQL and resets the view with a success alert.
- [ ] Update all content text to match the design and translations system.