# El Dugout Ve Agent Guidelines

Welcome to the **El Dugout Ve** workspace. This repository is a production-grade fullstack application for the Venezuelan professional baseball (LVBP) Wiki, consisting of an **Angular 19+** frontend, a **NestJS 10+** backend, and a **PostgreSQL 16** database managed via **Prisma ORM**, deployable to **Google Cloud Platform (Cloud Run & Cloud SQL)** with target domain **eldugoutve.com**.

---

## 🏛 System & Customization Overview

This workspace uses the Antigravity agent customization standard located in [`.agents/`](file:///Users/gabo/repos/el-dugout/.agents):

- **Architecture Documentation**: Detailed multi-agent roles and fullstack orchestration patterns are in [`.agents/architecture/AGENT_ARCHITECTURE.md`](file:///Users/gabo/repos/el-dugout/.agents/architecture/AGENT_ARCHITECTURE.md).
- **Runbooks & Recipes**: End-to-end recipes for feature generation, migrations, and deployment readiness are in [`.agents/architecture/WORKFLOWS.md`](file:///Users/gabo/repos/el-dugout/.agents/architecture/WORKFLOWS.md).
- **Available Skills**:
  - [`angular`](file:///Users/gabo/repos/el-dugout/.agents/skills/angular/SKILL.md): Frontend development, standalone components, Angular Signals, reactive forms, routing, and Karma testing.
  - [`nest`](file:///Users/gabo/repos/el-dugout/.agents/skills/nest/SKILL.md): Backend API development, modules, controllers, DTO validation, Prisma service, Swagger, and Jest testing.
  - [`postgres`](file:///Users/gabo/repos/el-dugout/.agents/skills/postgres/SKILL.md): PostgreSQL schema modeling, Prisma migrations, seeding, Docker Compose local DB, and GCP Cloud SQL.

---

## 🧭 Core Architectural Guidelines

### 1. General Principles
- **Separation of Concerns**: Keep frontend (`frontend/`), backend (`backend/`), and deployment configs (`deploy/`) decoupled.
- **Strict Typing**: Maintain TypeScript strict mode across both frontend and backend. Share or mirror API contracts via DTOs and typed models.
- **Environment Management**: Never commit secrets or hardcoded credentials. Use `.env.example` as the canonical template.
- **Clean Git Hygiene**: Keep commits atomic and descriptive.

### 2. Frontend Standards (`frontend/`)
- Always use **Standalone Components** (no `NgModule` unless strictly required for legacy 3rd-party libraries).
- Leverage **Angular Signals** (`signal()`, `computed()`, `effect()`, `input()`, `output()`) for reactive state management.
- Use modern control flow syntax (`@if`, `@for`, `@switch`) in templates.
- Use `inject()` for dependency injection instead of constructor parameter injection.
- Implement functional HTTP interceptors (`provideHttpClient(withInterceptors([...]))`).

### 3. Backend Standards (`backend/`)
- Follow modular NestJS architecture (`modules/<feature>/...`).
- Validate all incoming request payloads with DTOs using `class-validator` and `class-transformer`.
- Ensure all API endpoints are documented with `@nestjs/swagger` annotations (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`).
- Access the database exclusively via `PrismaService`.
- Use global filters (`AllExceptionsFilter`) and interceptors (`LoggingInterceptor`).
- Maintain Cloud Run health readiness via `@nestjs/terminus` on `/api/health`.

### 4. Database Standards (`backend/prisma/` & PostgreSQL)
- All table names and column mappings in PostgreSQL should be `snake_case` using `@map("...")` and `@@map("...")`.
- Use UUIDs for primary keys (`@id @default(uuid())`).
- Include audit timestamps (`createdAt` / `updatedAt`) on all persistent entities.
- Execute migrations using `npm run prisma:migrate` during development; never modify existing applied migration files manually.
- Run `npm run prisma:generate` whenever `schema.prisma` is updated.
