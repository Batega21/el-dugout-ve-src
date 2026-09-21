# Agent and Skills Architecture

This document describes the multi-agent orchestration model, skill system, and architectural boundaries governing development within the **El Dugout Ve** workspace.

---

## 1. High-Level Architecture Overview

```
                               ┌──────────────────────────────────────────────┐
                               │          Primary Orchestrator Agent          │
                               │        (Task Planning & Delegation)          │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         ▼                                            ▼                                            ▼
┌───────────────────────────────┐            ┌───────────────────────────────┐            ┌───────────────────────────────┐
│       Frontend Agent          │            │        Backend Agent          │            │        Database Agent         │
│     (Angular Specialist)      │            │       (NestJS Specialist)     │            │     (PostgreSQL Specialist)   │
├───────────────────────────────┤            ├───────────────────────────────┤            ├───────────────────────────────┤
│ Active Skill:                 │            │ Active Skill:                 │            │ Active Skill:                 │
│ • .agents/skills/angular      │            │ • .agents/skills/nest         │            │ • .agents/skills/postgres     │
├───────────────────────────────┤            ├───────────────────────────────┤            ├───────────────────────────────┤
│ Scope:                        │            │ Scope:                        │            │ Scope:                        │
│ • Standalone components       │            │ • Modules, DTOs, Controllers  │            │ • schema.prisma modeling      │
│ • Signals & reactive state    │            │ • Validation & Swagger Docs   │            │ • Migrations & seeding        │
│ • Routing & Interceptors      │            │ • Prisma service integration  │            │ • Docker Compose / Cloud SQL  │
│ • Karma / Jasmine testing     │            │ • Jest unit & e2e testing     │            │ • Query optimization          │
└───────────────────────────────┘            └───────────────────────────────┘            └───────────────────────────────┘
```

---

## 2. Agent Roles and Personas

### 👑 Primary Orchestrator
- **Role**: Coordinates high-level fullstack initiatives, decomposes features into sub-tasks, ensures architectural cohesion, and aligns frontend-backend contracts.
- **Responsibilities**:
  - Validates user intent and produces implementation plans.
  - Delegates layer-specific tasks to domain subagents or activates corresponding skills.
  - Ensures changes in one layer (e.g. database schema change) propagate consistently through the API down to the client UI.

### 🎨 Frontend Specialist (`angular`)
- **Role**: Builds and maintains the user interface, routing, and client-side reactive state.
- **Skill**: [`.agents/skills/angular`](file:///Users/gabo/repos/el-dugout/.agents/skills/angular/SKILL.md)
- **Key Principles**:
  - Always use Angular 19 Standalone Components.
  - Use Angular Signals for fine-grained reactivity.
  - Maintain typed API service clients consuming the NestJS REST API.
  - Maintain responsive styles and accessible HTML semantics.

### ⚙️ Backend Specialist (`nest`)
- **Role**: Develops robust, type-safe REST APIs, business logic, authorization, and data validation.
- **Skill**: [`.agents/skills/nest`](file:///Users/gabo/repos/el-dugout/.agents/skills/nest/SKILL.md)
- **Key Principles**:
  - Strict modular separation (`src/modules/<feature>`).
  - Exhaustive DTO validation via `class-validator` and `class-transformer`.
  - Comprehensive Swagger documentation annotations on all endpoints.
  - Clean error propagation through `AllExceptionsFilter`.
  - Health and readiness checks via Terminus.

### 🗄️ Database Specialist (`postgres`)
- **Role**: Manages data persistence, schema modeling, migration integrity, and relational integrity.
- **Skill**: [`.agents/skills/postgres`](file:///Users/gabo/repos/el-dugout/.agents/skills/postgres/SKILL.md)
- **Key Principles**:
  - Declarative schema definition in `backend/prisma/schema.prisma`.
  - Snake_case database column and table naming via `@map` and `@@map`.
  - Non-destructive, versioned migrations via `prisma migrate dev`.
  - Local container orchestration via Docker Compose.
  - Cloud SQL connectivity via Unix socket for GCP Cloud Run deployments.

---

## 3. The Skills System & Progressive Disclosure

Skills are self-contained procedural runbooks residing under `.agents/skills/<skill_name>/`.

```text
.agents/skills/<skill_name>/
├── SKILL.md                 # Required: Entrypoint with YAML frontmatter (name & description)
├── references/              # Detailed patterns, cheat-sheets, and API references
├── examples/                # Canonical code examples and templates (optional)
└── scripts/                 # Automation scripts and verification helpers (optional)
```

### Progressive Disclosure Lifecycle
1. **Discovery & Registration**:
   - The agent engine reads the frontmatter `name` and `description` of every skill during initialization.
   - The skill body remains unloaded, saving model context window capacity.
2. **Selective Activation**:
   - When a user prompt matches a skill description (e.g. "Create a new Angular component with signals" or "Add a Prisma migration for projects"), the model activates the specific skill.
3. **Deep Retrieval**:
   - The primary `SKILL.md` contains concise instructions and relative links to `references/*.md`.
   - Subdocs are only loaded into context when complex patterns or edge cases require them.

---

## 4. Architectural Boundaries and Safety Protocols

| Boundary | Restriction / Rule | Enforced By |
| :--- | :--- | :--- |
| **Frontend ↔ Backend** | Frontend communicates exclusively via HTTP REST endpoints. No direct database access or shared runtime code. | TypeScript compilation, Network separation |
| **Backend ↔ Database** | Direct SQL execution is discouraged; all database access is mediated through `PrismaService`. | Prisma ORM, Backend architecture |
| **Environment Secrets** | Secrets (`DATABASE_URL`, `JWT_SECRET`) must never be hardcoded into source control. Always read from environment variables. | `.gitignore`, ConfigService validation |
| **Database Migrations** | Never alter already deployed migrations in `prisma/migrations/`. Always generate forward migrations. | Prisma CLI, Agent verification |
| **Cloud Run Compatibility** | Containers must listen on `0.0.0.0:${PORT}` and supply valid `/api/health` probes. | Dockerfile, `main.ts`, Cloud Run spec |
