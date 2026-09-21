---
name: nest
description: >-
  Use this skill when developing, refactoring, or debugging the NestJS backend REST API application.
  Covers NestJS 10+ modular architecture, controllers, services, DTO validation with class-validator,
  database persistence with PrismaService, Swagger/OpenAPI documentation, Terminus health probes,
  and Jest unit/e2e testing.
---

# NestJS Backend Development Skill

This skill guides development within the `backend/` directory using modern **NestJS 10+** patterns.

---

## 🚀 Quick Reference Commands

Run all commands inside the `backend/` directory:

```bash
# Start development server with auto-reload (http://localhost:3000/api)
npm run start:dev

# Build for production
npm run build

# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Format TypeScript source code
npm run format
```

---

## 🏛 Core Architectural Rules for NestJS 10+

1. **Modular Domain Structure**:
   - Every domain feature resides in its own isolated module under `src/modules/<feature-name>/`.
   - Each module must encapsulate:
     - `<feature>.module.ts`: Declares controllers, providers, and imports.
     - `<feature>.controller.ts`: Handles HTTP routing, Swagger docs, and request/response mapping.
     - `<feature>.service.ts`: Implements business logic and calls `PrismaService`.
     - `dto/`: Contains typed request and response Transfer Objects.
   - Register new modules in `src/app.module.ts`.

2. **Strict Request Validation**:
   - All controller endpoints accepting payloads MUST define a DTO class with `class-validator` annotations (`@IsString()`, `@IsEmail()`, `@IsOptional()`, etc.).
   - The application has a global `ValidationPipe` configured with:
     - `whitelist: true` (strips unknown fields)
     - `forbidNonWhitelisted: true` (rejects requests containing unregistered fields)
     - `transform: true` (coerces primitive query/param types)

3. **Database Access via PrismaService**:
   - Never write raw SQL unless complex aggregation requires it.
   - Inject `PrismaService` from `src/database/prisma.service.ts` into domain services.
   - Keep transactions encapsulated within service methods using `this.prisma.$transaction(...)`.

4. **Comprehensive OpenAPI / Swagger Documentation**:
   - Tag controllers with `@ApiTags('<Feature>')`.
   - Annotate route handlers with `@ApiOperation({ summary: '...' })` and `@ApiResponse(...)`.
   - Protect authenticated routes with `@ApiBearerAuth()` and `@UseGuards(JwtAuthGuard)`.
   - Annotate DTO properties with `@ApiProperty()` or `@ApiPropertyOptional()`.
   - Swagger is served at `/api/docs`.

5. **Cloud Run Compatibility**:
   - The server must bind to `0.0.0.0` (configured in `src/main.ts`).
   - The port must read from `process.env.PORT` (defaults to 3000 locally, 8080 in Cloud Run).
   - Liveness and readiness probes are implemented via Terminus in `src/modules/health/`.

---

## 📁 Directory Structure (`backend/src/`)

```text
src/
├── common/                # Global filters, interceptors, guards, decorators
│   ├── filters/           # AllExceptionsFilter (standardized error responses)
│   ├── interceptors/      # LoggingInterceptor (request timing & status logging)
│   └── guards/            # JWT and role-based authorization guards
├── config/                # Configuration module & environment validation
│   └── configuration.ts   # Typed environment config using class-validator
├── database/              # PrismaService database lifecycle module
│   ├── database.module.ts
│   └── prisma.service.ts
├── modules/               # Domain feature modules
│   ├── auth/              # JWT authentication & passport strategy
│   ├── health/            # Cloud Run Terminus health checks
│   └── users/             # Users CRUD domain module
├── app.module.ts          # Root application module aggregating features
└── main.ts                # Bootstrap: validation, Swagger, CORS, error filters
```

---

## When to Apply

Reference these guidelines when:
- Writing new NestJS modules, controllers, or services
- Implementing authentication and authorization
- Setting up Prisma database operations
- Creating DTOs and validation pipes
- Adding middleware or guards
- Implementing error handling and logging
- Reviewing NestJS code for best practices
- Refactoring existing NestJS applications

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Security | CRITICAL | `security-` |
| 2 | Performance | HIGH | `performance-` |
| 3 | Architecture | HIGH | `architecture-` |
| 4 | Error Handling | HIGH | `error-handling-` |
| 5 | Validation | CRITICAL | `validation-` |
| 6 | Database | CRITICAL | `database-` |
| 7 | Authentication | CRITICAL | `auth-` |
| 8 | API | MEDIUM | `api-` |
| 9 | Configuration | CRITICAL | `config-` |
| 10 | Testing | MEDIUM | `testing-` |
| 11 | Deployment | MEDIUM | `deployment-` |
| 12 | Middleware | MEDIUM | `middleware-` |
| 13 | Advanced | HIGH | `advanced-` |

## Quick Reference

### 1. Security (CRITICAL)

- `security-cors-whitelist` - Enable CORS with whitelist origins only
- `security-dependency-audit` - Regular dependency security audits with bun
- `security-helmet-headers` - Use Helmet middleware for security headers

### 2. Performance (HIGH)

- `performance-redis-caching` - Cache frequently used data with Redis

### 3. Architecture (HIGH)

- `architecture-short-functions` - Keep functions short and single purpose
- `architecture-feature-modules` - Organize code by feature modules
- `architecture-no-dead-code` - Remove unused code and dependencies
- `architecture-thin-controllers` - Single responsibility - separate controller and service
- `architecture-naming-conventions` - Use consistent naming conventions
- `architecture-event-driven` - Use event-driven architecture for loose coupling

### 4. Error Handling (HIGH)

- `error-handling-exception-filter` - Enable global exception filter
- `error-handling-structured-logging` - Implement proper logging strategy

### 5. Validation (CRITICAL)

- `validation-custom-pipes` - Create custom pipes for query parameter transformation
- `validation-dto-validation` - Validate all inputs with DTOs and ValidationPipe

### 6. Database (CRITICAL)

- `database-parameterized-queries` - Use parameterized queries to prevent SQL injection (Prisma v7)

### 7. Authentication (CRITICAL)

- `auth-password-hashing` - Use Bun's built-in Crypto for secure password hashing (argon2/bcrypt)
- `auth-route-guards` - Use guards for route protection

### 8. API (MEDIUM)

- `api-cursor-pagination` - Use cursor-based pagination for large datasets
- `api-swagger-docs` - Generate Swagger/OpenAPI documentation

### 9. Configuration (CRITICAL)

- `config-no-secrets` - Never hardcode secrets - use environment variables

### 10. Testing (MEDIUM)

- `testing-unit-tests` - Write comprehensive unit tests

### 11. Deployment (MEDIUM)

- `deployment-health-checks` - Implement health check endpoints

### 12. Middleware (MEDIUM)

- `middleware-compression` - Enable compression middleware for responses
- `middleware-rate-limiting` - Implement rate limiting for all routes

### 13. Advanced (HIGH)

- `advanced-lazy-loading` - Lazy load non-critical modules
- `advanced-scheduled-tasks` - Use @nestjs/schedule for cron jobs and scheduled tasks

## How to Use

Read individual rule files for detailed explanations and code examples:

```
./references/security-cors-whitelist.md
./references/auth-route-guards.md
./references/validation-dto-validation.md
./references/_sections.md
```

Each rule file contains:
- "For AI Agents" section with step-by-step implementation instructions
- Quick Reference Checklist for code review
- ❌ WRONG vs ✅ CORRECT patterns with file locations
- Installation commands using `bun add`
- Comprehensive code examples for NestJS + Prisma
- Security and performance considerations

## Key Patterns

### Agent-Friendly Format

All rules are optimized for AI agents with:
- Explicit file locations (e.g., `src/users/users.service.ts`)
- Step-by-step "For AI Agents" sections
- ✅ CORRECT vs ❌ WRONG pattern comparisons
- Quick Reference Checklists
- Clear installation instructions

### Technology Stack

- **Framework**: NestJS with Express/Fastify adapter
- **Runtime**: Bun (native crypto, scheduling)
- **Database**: Prisma v7 (sql template tag, interactive transactions)
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, CORS whitelisting, rate limiting
- **Scheduling**: @nestjs/schedule with cron/interval decorators
- **Events**: EventEmitter2 for loose coupling

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

## Build Commands

```bash
cd packages/nestjs-best-practices-build
bun install
bun run build      # Generate AGENTS.md
bun run validate   # Validate rule files
bun run dev        # Build and validate
```

## Statistics

- **13 sections** covering all aspects of NestJS development
- **26 rules** prioritized by impact (CRITICAL, HIGH, MEDIUM)
- **Prisma v7** compatible database patterns
- **Bun runtime** native features (Crypto.hashPassword, @nestjs/schedule)
- **Agent-optimized** for automated code generation and review

## 🛠 Step-by-Step Module Creation Procedure

### Step 1: Create DTOs
In `src/modules/<feature>/dto/`:
- `create-<feature>.dto.ts`: Decorated with `class-validator` and `class-transformer` rules.
- `update-<feature>.dto.ts`: Uses `PartialType(Create<Feature>Dto)` from `@nestjs/swagger`.

### Step 2: Implement Service
In `src/modules/<feature>/<feature>.service.ts`:
- Inject `PrismaService`.
- Implement standard operations: `create`, `findAll`, `findOne`, `update`, `remove`.
- Throw appropriate NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`).

### Step 3: Implement Controller
In `src/modules/<feature>/<feature>.controller.ts`:
- Use `@Controller('<feature>')`.
- Add `@ApiTags('<feature>')`.
- Inject the domain service and implement handlers.

### Step 4: Register in App Module
Add the feature module to `imports` in `src/app.module.ts`.

### Step 5: Verification & Testing
```bash
cd backend
npm run test
npm run build
```
See [references/patterns.md](./references/patterns.md) for complete template code.
