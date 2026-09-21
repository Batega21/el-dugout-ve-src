# PostgreSQL & Prisma Modeling Patterns

Reference implementations for database relations, indexes, migrations, and administration.

---

## 1. Common Relation Patterns in Prisma

### One-to-Many (1:N)
```prisma
model User {
  id       String    @id @default(uuid())
  email    String    @unique
  projects Project[]

  @@map("users")
}

model Project {
  id      String @id @default(uuid())
  title   String
  ownerId String @map("owner_id")
  owner   User   @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@map("projects")
}
```

### Many-to-Many (M:N) with Explicit Join Model (Recommended)
```prisma
model User {
  id    String             @id @default(uuid())
  email String             @unique
  teams UsersOnTeams[]

  @@map("users")
}

model Team {
  id      String             @id @default(uuid())
  name    String
  members UsersOnTeams[]

  @@map("teams")
}

model UsersOnTeams {
  userId    String   @map("user_id")
  teamId    String   @map("team_id")
  role      String   @default("MEMBER")
  joinedAt  DateTime @default(now()) @map("joined_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@id([userId, teamId])
  @@map("users_on_teams")
}
```

---

## 2. Safe Migration & Rollback Runbook

### Migration Drift Detection
If the database schema drifts or conflicts occur:
```bash
cd backend
npx prisma migrate status
```

### Resolving Migration Conflicts Locally
If a local migration fails in development before being committed:
1. Delete the failed migration folder in `backend/prisma/migrations/`.
2. Reset the local development database (⚠️ Clears all local data):
   ```bash
   npx prisma migrate reset
   ```
3. Re-run migration and seed:
   ```bash
   npm run prisma:migrate -- --name initial_schema
   npm run prisma:seed
   ```

---

## 3. Database Backup & Restore with Docker

### Backup Local Database
```bash
# Dump PostgreSQL database to local SQL file
docker exec -t el_dugout_postgres pg_dump -U postgres el_dugout_ve > backup.sql
```

### Restore Database
```bash
# Restore from SQL dump file
cat backup.sql | docker exec -i el_dugout_postgres psql -U postgres -d el_dugout_ve
```

---

## 4. Adminer Access Details
- **URL**: `http://localhost:8081`
- **System**: `PostgreSQL`
- **Server**: `postgres` (or `localhost` if connecting directly from host network)
- **Username**: `postgres`
- **Password**: `postgres` (or value of `POSTGRES_PASSWORD` in `.env`)
- **Database**: `el_dugout_ve` (or value of `POSTGRES_DB` in `.env`)
