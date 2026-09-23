# El Dugout Ve (La Biblia del Béisbol Venezolano)

**El Dugout Ve** (`eldugoutve.com`) es una enciclopedia web y plataforma comunitaria para los fanáticos del béisbol profesional venezolano (Liga Venezolana de Béisbol Profesional - LVBP). Diseñada con arquitectura desacoplada de alto rendimiento y desplegable en **Google Cloud Platform (GCP)**.

---

## 🏗 System Architecture

```
                                    ┌────────────────────────┐
                                    │      Web Browser       │
                                    │    eldugoutve.com      │
                                    └───────────┬────────────┘
                                                │ HTTPS
                                                ▼
┌────────────────────────────────────────── Google Cloud Platform ──────────────────────────────────────────┐
│                                                                                                           │
│   ┌─────────────────────────────────── Cloud Run Services ────────────────────────────────────────────┐   │
│   │                                                                                                   │   │
│   │   ┌─────────────────────────────┐                    ┌─────────────────────────────┐              │   │
│   │   │     Frontend (Angular)      │    API Calls       │      Backend (NestJS)       │              │   │
│   │   │   Multi-stage Nginx Alpine  ├───────────────────►│    Modular REST API App     │              │   │
│   │   │   Port: 8080                │                    │    Port: 8080               │              │   │
│   │   └─────────────────────────────┘                    └──────────────┬──────────────┘              │   │
│   │                                                                     │                             │   │
│   └─────────────────────────────────────────────────────────────────────┼─────────────────────────────┘   │
│                                                                         │ Unix Socket                     │
│                                                                         │ /cloudsql/INSTANCE_CONNECTION   │
│                                                                         ▼                                 │
│   ┌─────────────────────────────┐                        ┌─────────────────────────────┐                  │
│   │     GCP Secret Manager      │                        │       Google Cloud SQL      │                  │
│   │  DATABASE_URL, JWT_SECRET   │                        │   Managed PostgreSQL 16     │                  │
│   └──────────────┬──────────────┘                        └─────────────────────────────┘                  │
│                  │ Injected at startup                                                                    │
│                  └──────────────────────────────────────────────────────┘                                 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Tech Stack

| Layer | Technology | Key Features |
| :--- | :--- | :--- |
| **Frontend** | Angular 22+ | Standalone components, Angular Signals, typed HTTP interceptors, responsive styling |
| **Backend** | NestJS 10+ | Clean architecture, DTO validation (`class-validator`), Swagger/OpenAPI docs, Terminus health probes |
| **Database** | PostgreSQL 16 + Prisma ORM | Automated schema migrations, connection pooling, seed scripts, Prisma Studio GUI |
| **Containers** | Docker & Docker Compose | Multi-stage slim production images, local PostgreSQL 16 + Adminer GUI |
| **Cloud (GCP)** | Google Cloud Run & Cloud SQL | Serverless auto-scaling containers, managed relational database via Cloud SQL Unix socket |
| **CI/CD & IaC** | Cloud Build & Terraform | Automated build-push-deploy workflows and repeatable infrastructure as code |

---

## 📁 Repository Structure

```
el-dugout-ve/
├── backend/                   # NestJS REST API application
│   ├── prisma/                # Prisma schema, migrations, and seed script
│   ├── src/
│   │   ├── common/            # Global filters (error handling), interceptors (logging)
│   │   ├── config/            # Environment validation (class-validator)
│   │   ├── database/          # Prisma database service and lifecycle hooks
│   │   └── modules/
│   │       ├── auth/          # Authentication module
│   │       ├── health/        # Liveness & readiness probes for Cloud Run
│   │       └── users/         # Users CRUD domain module
│   ├── Dockerfile             # Multi-stage production build (Node.js 22 Alpine)
│   └── package.json
├── frontend/                  # Modern Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Interceptors, API client, and models
│   │   │   ├── features/      # Home, Users management, Architecture pages
│   │   │   └── shared/        # Reusable UI components (Navbar, Footer, Badges)
│   │   └── environments/      # Environment-specific configuration
│   ├── nginx.conf             # Hardened Nginx configuration for Cloud Run SPA
│   ├── Dockerfile             # Multi-stage build -> Nginx Alpine
│   └── package.json
├── deploy/                    # Google Cloud deployment configurations
│   ├── cloudbuild.yaml        # Google Cloud Build CI/CD pipeline
│   ├── gcp-deploy.sh          # One-command CLI provisioning with gcloud
│   └── terraform/             # Terraform infrastructure as code (Cloud SQL, Cloud Run, IAM)
├── docker-compose.yml         # Local orchestration (PostgreSQL 16 + Adminer)
├── .env.example               # Canonical environment configuration template
└── package.json               # Root scripts for fullstack orchestration
```

---

## 🚀 Quickstart: Local Development

### 1. Prerequisites

- **Node.js**: v22+ or v24+
- **Docker & Docker Compose**: Installed and running

### 2. Configure Environment Variables

Copy the template configuration to `.env`:

```bash
cp .env.example .env
```

### 3. Launch Local Database (PostgreSQL 16)

Start the PostgreSQL database and Adminer web GUI:

```bash
npm run docker:db
```

- **PostgreSQL**: Accessible at `localhost:5432`
- **Adminer GUI**: Open [http://localhost:8081](http://localhost:8081) (System: `PostgreSQL`, Server: `postgres`, User: `postgres`, Password: `postgres`, Database: `el_dugout_ve`)

### 4. Install Dependencies & Seed Database

```bash
# In backend:
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Swagger Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check Probe**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### 5. Launch Frontend (Angular)

In a separate terminal:

```bash
cd frontend
npm install
npm run start
```

- **Angular App**: Open [http://localhost:4200](http://localhost:4200)

---

## 🗄 Database Management with Prisma

From the root directory or `backend/`:

| Command | Action |
| :--- | :--- |
| `npm run prisma:migrate` | Create and apply new migrations |
| `npm run prisma:generate` | Re-generate Prisma Client types |
| `npm run prisma:studio` | Launch visual database editor on `http://localhost:5555` |
| `npm run prisma:seed` | Seed initial admin and test data |

---

## ☁️ Google Cloud Platform Deployment

### Option A: Using the Automated Setup Script (`gcloud`)

Ensure you are logged into your GCP account:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Execute the provisioning script:

```bash
./deploy/gcp-deploy.sh
```

This automated script:

1. Enables required GCP APIs (`run`, `sqladmin`, `artifactregistry`, `secretmanager`, `cloudbuild`).
2. Creates a Docker repository in **Google Artifact Registry**.
3. Provisions a **Google Cloud SQL (PostgreSQL 16)** instance and database.
4. Generates and stores credentials in **Google Secret Manager**.
5. Submits container builds to **Cloud Build** and deploys **Cloud Run** services.

### Option B: Using Terraform (Infrastructure as Code)

```bash
cd deploy/terraform
terraform init
terraform plan -var="project_id=YOUR_PROJECT_ID"
terraform apply -var="project_id=YOUR_PROJECT_ID"
```

### Option C: Cloud SQL Socket Connection String on Cloud Run

When running on Cloud Run, connect to Cloud SQL using the native Unix socket without public IP exposure:

```bash
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost/DB_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"
```

Cloud Run automatically binds the socket under `/cloudsql/...` when `--add-cloudsql-instances` is specified.

---

## 🧪 Testing & Verification

```bash
# Run backend unit tests
npm run test:backend

# Run production builds for both apps
npm run build:all
```

### 1. Color Palette Tokens
* **Primary (Baseball Crimson Red):**
  - Light mode: `#dc2626` / `text-red-600` / `bg-red-600`
  - Dark mode: `#ef4444` / `text-red-500` / `bg-red-500`
  - Accent / Focus: `#b91c1c` / `hover:bg-red-700`
* **Secondary (Navy Blue):**
  - Light mode: `#1e3a8a` / `text-blue-900` / `bg-blue-900`
  - Dark mode: `#3b82f6` / `text-blue-400` / `bg-blue-600`
  - Deep Navy Canvas/Surfaces: `#0f172a` (Dark mode card backgrounds)
* **Accent / Tertiary (Vintage Ochre / Gold Accent):**
  - Ochre Accent: `#d97706` / `#b45309` (Represents vintage trophies, awards, batting titles, hall of fame badges).
* **Surfaces & Typography Backgrounds:**
  - **Dark Theme (Default):**
    * Background: `#08090c` or `#0b0f19` (Deep graphite/black)
    * Card/Containers: `#111827` or `#161f30` with border `#1f2937`
    * Text High-contrast: `#f9fafb` (White/Off-white)
    * Text Muted/Secondary: `#9ca3af`
  - **Light Theme:**
    * Background: `#f8fafc` (Clean, crisp gray-white)
    * Card/Containers: `#ffffff` with subtle border `#e2e8f0`
    * Text High-contrast: `#0f172a` (Deep slate)
    * Text Muted/Secondary: `#64748b`