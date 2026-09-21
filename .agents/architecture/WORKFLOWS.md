# Fullstack Agent Workflows & Runbooks

This guide provides end-to-end operational workflows for agents and developers working across the Angular, NestJS, and PostgreSQL stack.

---

## 🔄 Workflow 1: Implementing a New End-to-End Feature

Follow this sequential pipeline whenever adding a new domain entity (e.g., `Task`, `Organization`, `Order`).

```
Step 1: Database Model ──► Step 2: NestJS Module ──► Step 3: Angular Feature
(backend/prisma/)          (backend/src/modules/)     (frontend/src/app/features/)
```

### Step 1: Database Schema & Migration (`postgres` skill)
1. Open `backend/prisma/schema.prisma`.
2. Define the new model adhering to snake_case database mappings:
   ```prisma
   model Item {
     id          String   @id @default(uuid())
     title       String
     description String?
     createdAt   DateTime @default(now()) @map("created_at")
     updatedAt   DateTime @updatedAt @map("updated_at")

     ownerId     String   @map("owner_id")
     owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

     @@map("items")
   }
   ```
3. Generate the migration and update the Prisma Client:
   ```bash
   cd backend
   npm run prisma:migrate -- --name add_items_table
   npm run prisma:generate
   ```

### Step 2: Backend Module & API (`nest` skill)
1. Create module directory `backend/src/modules/items/`.
2. Implement:
   - `dto/create-item.dto.ts` & `dto/update-item.dto.ts` with `class-validator` and `@ApiProperty()`.
   - `items.service.ts` injecting `PrismaService`.
   - `items.controller.ts` with `@ApiTags('Items')`, `@UseGuards(JwtAuthGuard)`, and route handlers.
   - `items.module.ts` registering controller and service.
3. Register `ItemsModule` in `backend/src/app.module.ts`.
4. Verify endpoints and Swagger documentation at `http://localhost:3000/api/docs`.

### Step 3: Frontend Feature Integration (`angular` skill)
1. Define the TypeScript model in `frontend/src/app/core/models/item.model.ts`.
2. Implement the API service in `frontend/src/app/core/services/items.service.ts`:
   - Inject `HttpClient` via `inject(HttpClient)`.
   - Implement typed methods returning Observables.
3. Create standalone UI components in `frontend/src/app/features/items/`:
   - Use Signals (`signal()`, `computed()`) to hold state.
   - Use `@if` / `@for` in component templates.
4. Add the feature route to `frontend/src/app/app.routes.ts` with lazy loading:
   ```typescript
   {
     path: 'items',
     loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent),
   }
   ```

---

## 🗄️ Workflow 2: Database Migration & Seeding Runbook

### Local Environment
1. Ensure the PostgreSQL container is running:
   ```bash
   docker compose up -d postgres adminer
   ```
2. Check database connection health:
   ```bash
   docker compose ps
   ```
3. Apply pending migrations:
   ```bash
   cd backend && npm run prisma:migrate
   ```
4. Run the seed script:
   ```bash
   cd backend && npm run prisma:seed
   ```
5. Inspect data via Adminer at `http://localhost:8081` (System: PostgreSQL, Server: `postgres`, User: `postgres`, DB: `el_dugout_ve`).

---

## 🧪 Workflow 3: Fullstack Testing & Verification

Run these verification suites before committing code:

### Backend Checks
```bash
cd backend
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end API tests
npm run build          # Verify NestJS compilation
```

### Frontend Checks
```bash
cd frontend
npm run test           # Run Jasmine unit tests via Karma
npm run build          # Run production Angular build
```

---

## 🚀 Workflow 4: Containerization & Cloud Run Verification

To ensure container readiness before pushing to Google Cloud Platform:

```bash
# Build and run fullstack environment via docker-compose
docker compose --profile fullstack up --build -d

# Verify services:
curl -f http://localhost:3000/api/health       # NestJS Cloud Run probe
curl -I http://localhost:8080                  # Angular Nginx static server
```
