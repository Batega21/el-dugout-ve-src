-- CreateEnum
CREATE TYPE "StatCategory" AS ENUM ('BATTING_AVERAGE', 'HITS', 'DOUBLES', 'TRIPLES', 'HOME_RUNS', 'RUNS', 'INNINGS_PITCHED');

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_leaders" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "team_raw" TEXT NOT NULL,
    "team_id" TEXT,
    "category" "StatCategory" NOT NULL,
    "stat_value" DECIMAL(6,3) NOT NULL,
    "extra_attributes" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_leaders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seasons_code_key" ON "seasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players_slug_key" ON "players"("slug");

-- CreateIndex
CREATE INDEX "season_leaders_category_season_id_idx" ON "season_leaders"("category", "season_id");

-- CreateIndex
CREATE INDEX "season_leaders_player_id_idx" ON "season_leaders"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "season_leaders_season_id_player_id_category_key" ON "season_leaders"("season_id", "player_id", "category");

-- AddForeignKey
ALTER TABLE "season_leaders" ADD CONSTRAINT "season_leaders_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_leaders" ADD CONSTRAINT "season_leaders_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_leaders" ADD CONSTRAINT "season_leaders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
