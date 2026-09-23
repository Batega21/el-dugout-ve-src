# PostgreSQL

The uploaded files represent **historical annual batting leaderboards** (specifically LVBP — Venezuelan Professional Baseball League, spanning 1946 to 2026) across six major offensive categories:

* **Batting Average (`lider-bate.xlsx`):** `AVG`, plus contextual metrics (`JJ` - Games, `VB` - At-bats, `H` - Hits).
* **Hits (`lider-hits.xlsx`):** Total hits (`H`).
* **Doubles (`lider-dobles.xlsx`):** Total doubles (`D`).
* **Triples (`lider-triples.xlsx`):** Total triples (`TOTAL`).
* **Home Runs (`lider-homerun.xlsx`):** Total home runs (`HR`).
* **Runs Scored (`lider-anotadas.xlsx`):** Total runs (`CA`).

Because these datasets contain **only the league leaders** (including frequent ties, such as 67 tied instances in triples and 38 in home runs) and occasional split-team entries (e.g., `MAG-ANZ`, `Ara-Zul`), the database schema and ingestion strategy should account for normalized entities, composite metrics, and idempotent imports.

---

### 1. Database Schema Design (PostgreSQL)

Rather than creating separate tables for each Excel file (which would lead to duplicate player and team data), use a normalized relational schema with a unified **`leaderboard_records`** table.

```sql
-- 1. Seasons Table
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,      -- e.g., '1946-46', '1946-47', '2025-26'
    start_year INT NOT NULL,
    end_year INT NOT NULL
);

-- 2. Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,     -- e.g., 'Magallanes', 'Caracas', 'Vargas'
    abbreviation VARCHAR(10)
);

-- 3. Players Table (Unified entity across all leaderboards)
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,     -- URL-safe normalized name (e.g., 'jesus-ramos')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Statistical Categories Enum
CREATE TYPE stat_category AS ENUM (
    'BATTING_AVERAGE',
    'HITS',
    'DOUBLES',
    'TRIPLES',
    'HOME_RUNS',
    'RUNS'
);

-- 5. Unified Historical Leaderboard Entries
CREATE TABLE season_leaders (
    id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(id) ON DELETE CASCADE,
    player_id INT REFERENCES players(id) ON DELETE CASCADE,
    team_raw VARCHAR(50) NOT NULL,          -- Preserves exact label (e.g. 'Ara-Zul' or 'C. Caracas')
    team_id INT REFERENCES teams(id),       -- Nullable link if mapped to canonical team
    category stat_category NOT NULL,
    stat_value NUMERIC(6, 3) NOT NULL,     -- Accommodates both integers (48 hits) and batting averages (0.403)
    extra_attributes JSONB DEFAULT '{}',    -- For 'JJ', 'VB' present in 'lider-bate.xlsx'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevents duplicate imports on re-runs while allowing ties across different players
    CONSTRAINT uq_season_player_category UNIQUE (season_id, player_id, category)
);

-- Indexes for fast query retrieval
CREATE INDEX idx_season_leaders_category ON season_leaders(category, season_id);
CREATE INDEX idx_season_leaders_player ON season_leaders(player_id);

```

---

### 2. NestJS File Upload & Parsing Architecture

For handling Excel file uploads in NestJS:

#### Required Dependencies

* **Upload handling:** `@types/multer` (NestJS built-in Express engine)
* **Spreadsheet parsing:** `exceljs` (stream/buffer-based, modern TypeScript typings)

```bash
npm install exceljs
npm install -D @types/multer

```

#### Upload Controller

Use NestJS `FileInterceptor` or `FilesInterceptor` with memory storage to parse the buffer directly without writing temporary files to disk:

```typescript
// src/imports/imports.controller.ts
import { 
  Controller, 
  Post, 
  UploadedFiles, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LeaderboardImportService } from './leaderboard-import.service';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importService: LeaderboardImportService) {}

  @Post('leaders')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per file
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return cb(new BadRequestException('Only Excel files are accepted'), false);
      }
      cb(null, true);
    }
  }))
  async uploadLeaderFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.importService.processUploadedFiles(files);
  }
}

```

---

### 3. Ingestion Pipeline & Normalization Strategy

Implement a category resolver and upsert pipeline in your service:

```typescript
// src/imports/leaderboard-import.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface ParsedLeaderRow {
  season: string;
  playerName: string;
  team: string;
  statValue: number;
  category: 'BATTING_AVERAGE' | 'HITS' | 'DOUBLES' | 'TRIPLES' | 'HOME_RUNS' | 'RUNS';
  extraAttributes?: Record<string, any>;
}

@Injectable()
export class LeaderboardImportService {
  private readonly logger = new Logger(LeaderboardImportService.name);

  // Map file signatures or headers to canonical category
  private detectCategory(fileName: string, headerKeys: string[]): string {
    const lower = fileName.toLowerCase();
    if (lower.includes('bate') || headerKeys.includes('avg')) return 'BATTING_AVERAGE';
    if (lower.includes('homerun') || headerKeys.includes('hr')) return 'HOME_RUNS';
    if (lower.includes('dobles') || headerKeys.includes('d')) return 'DOUBLES';
    if (lower.includes('triples') || headerKeys.includes('total')) return 'TRIPLES';
    if (lower.includes('hits') || headerKeys.includes('h')) return 'HITS';
    if (lower.includes('anotadas') || headerKeys.includes('ca')) return 'RUNS';
    throw new Error(`Unrecognized category format in ${fileName}`);
  }

  async parseWorkbook(file: Express.Multer.File): Promise<ParsedLeaderRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.worksheets[0]; // First sheet contains data
    const rows: ParsedLeaderRow[] = [];

    // Extract headers (Row 1)
    const headerRow = worksheet.getRow(1);
    const headers: { [colNumber: number]: string } = {};
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value || '').trim().toLowerCase();
    });

    const category = this.detectCategory(file.originalname, Object.values(headers)) as any;

    // Parse subsequent data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const rowData: Record<string, any> = {};
      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber];
        if (key) rowData[key] = cell.value;
      });

      const season = String(rowData['año'] || rowData['year'] || '').trim();
      const playerName = String(rowData['jugador'] || rowData['bateador'] || '').trim();
      const team = String(rowData['equipo'] || '').trim();

      if (!season || !playerName) return;

      let statValue = 0;
      let extraAttributes: Record<string, any> = {};

      if (category === 'BATTING_AVERAGE') {
        statValue = parseFloat(rowData['avg'] || 0);
        extraAttributes = {
          jj: rowData['jj'] ?? null,
          vb: rowData['vb'] ?? null,
          h: rowData['h'] ?? null
        };
      } else if (category === 'HOME_RUNS') {
        statValue = parseInt(rowData['hr'] || 0, 10);
      } else if (category === 'DOUBLES') {
        statValue = parseInt(rowData['d'] || 0, 10);
      } else if (category === 'TRIPLES') {
        statValue = parseInt(rowData['total'] || 0, 10);
      } else if (category === 'HITS') {
        statValue = parseInt(rowData['h'] || 0, 10);
      } else if (category === 'RUNS') {
        statValue = parseInt(rowData['ca'] || 0, 10);
      }

      rows.push({
        season,
        playerName,
        team,
        statValue,
        category,
        extraAttributes
      });
    });

    return rows;
  }
}

```

---

### 4. Database Persistence & Atomic Upsert Best Practices

When writing to PostgreSQL via your ORM (e.g., Prisma, TypeORM, or Kysely):

1. **Atomic Batch Transactions:** Wrap the parsed rows inside a single database transaction (`tx`).
2. **Player Identity Deduplication:**
* Normalize names using trimming and lowercase slugification (`jesus-ramos`) so that Jesús Ramos in `lider-hits.xlsx` maps to the exact same `player_id` as in `lider-anotadas.xlsx`.


3. **Idempotent Upserts:**
* Execute an `ON CONFLICT (season_id, player_id, category) DO UPDATE SET stat_value = EXCLUDED.stat_value, extra_attributes = EXCLUDED.extra_attributes`. This allows re-uploading spreadsheets without throwing unique constraint violations.


4. **Handling Mid-Season Trades (`Ara-Zul`, `MAG-ANZ`):**
* Keep the original string in `team_raw` on `season_leaders`. Do not force a hard foreign key constraint on composite team strings during ingestion; resolve standard teams lazily or via an alias mapping table.

Notas

- Records.
- Prensa.
- Lideres no existe.
- Movimiento de trafico de casa de apuestas para el dugout.
- Definir el alcanse de datos.
- Definir portada.
