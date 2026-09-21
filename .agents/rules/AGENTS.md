# Workspace Rules for AI Agents

These rules apply across all directories and subdirectories in the El Dugout Ve repository.

## 1. Safety & Stability Rules
- Never delete or modify `.env` without user confirmation.
- Never write database credentials or secrets directly into source code files.
- When creating database schema changes, always generate a migration rather than running destructive database resets without warning.
- Always check that services compile cleanly after making code edits (`npm run build` in `backend` and `frontend`).

## 2. Directory & Component Boundaries
- `frontend/`: Exclusively handles presentation, routing, UI state, and client-side HTTP communication. Never import backend modules or Prisma clients here.
- `backend/`: Exclusively handles API routing, authentication, business logic, validation, and database operations. Never import frontend code or browser-only APIs here.
- `deploy/`: Dedicated to Terraform, Cloud Build, and deployment scripts. Never store application runtime code here.

## 3. Tool Usage Rules
- Keep edits localized and targeted using precise string replacement tools.
- When executing tests or builds, run them within their respective subdirectories (`backend` or `frontend`).
- Use the specialized skills in `.agents/skills/` (`angular`, `nest`, `postgres`) whenever working on layer-specific features.
