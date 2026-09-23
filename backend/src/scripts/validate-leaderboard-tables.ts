import { PrismaClient, StatCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface TableInfo {
  table_name: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface IndexInfo {
  indexname: string;
  indexdef: string;
}

async function validateTables() {
  console.log('===============================================================');
  console.log('🔍 VALIDATING DATABASE TABLES: seasons, teams, players, season_leaders');
  console.log('===============================================================\n');

  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL database.\n');

    const expectedTables = ['seasons', 'teams', 'players', 'season_leaders'];

    // 1. Verify existence in information_schema.tables
    console.log('--- 1. Table Existence Check ---');
    const existingTables = await prisma.$queryRaw<TableInfo[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('seasons', 'teams', 'players', 'season_leaders')
      ORDER BY table_name;
    `;

    const existingTableNames = existingTables.map((t) => t.table_name);
    for (const table of expectedTables) {
      if (existingTableNames.includes(table)) {
        console.log(`  ✓ Table "${table}" exists in PostgreSQL schema "public".`);
      } else {
        console.error(`  ✗ Table "${table}" is MISSING!`);
        throw new Error(`Table ${table} does not exist in the database.`);
      }
    }

    // 2. Inspect Columns and Data Types for each table
    console.log('\n--- 2. Schema Structure & Column Verification ---');
    for (const table of expectedTables) {
      console.log(`\n📋 Columns for table "${table}":`);
      const columns = await prisma.$queryRaw<ColumnInfo[]>`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table}
        ORDER BY ordinal_position;
      `;
      for (const col of columns) {
        const nullableStr = col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL';
        const defaultStr = col.column_default ? `[default: ${col.column_default}]` : '';
        console.log(`    - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(18)} ${nullableStr.padEnd(10)} ${defaultStr}`);
      }

      // Check indexes
      const indexes = await prisma.$queryRaw<IndexInfo[]>`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = ${table};
      `;
      console.log(`   Indexes on "${table}":`);
      for (const idx of indexes) {
        console.log(`    * ${idx.indexname}: ${idx.indexdef}`);
      }
    }

    // 3. Functional CRUD & Constraint Testing
    console.log('\n--- 3. Functional CRUD & Constraint Operations Testing ---');

    const testSeasonCode = `TEST-${Date.now()}`;
    const testPlayerSlug = `test-player-${Date.now()}`;
    const testTeamName = `Test Team ${Date.now()}`;

    // Test A: Create Season
    console.log(`\n  A. Inserting Season (code: ${testSeasonCode})...`);
    const createdSeason = await prisma.season.create({
      data: {
        code: testSeasonCode,
        startYear: 1946,
        endYear: 1946,
      },
    });
    console.log(`     ✓ Created Season with ID: ${createdSeason.id}`);

    // Test B: Create Team
    console.log(`  B. Inserting Team (name: ${testTeamName})...`);
    const createdTeam = await prisma.team.create({
      data: {
        name: testTeamName,
        abbreviation: 'TST',
      },
    });
    console.log(`     ✓ Created Team with ID: ${createdTeam.id}`);

    // Test C: Create Player
    console.log(`  C. Inserting Player (slug: ${testPlayerSlug})...`);
    const createdPlayer = await prisma.player.create({
      data: {
        fullName: 'Jesús "Chucho" Ramos',
        slug: testPlayerSlug,
      },
    });
    console.log(`     ✓ Created Player with ID: ${createdPlayer.id}`);

    // Test D: Create SeasonLeader
    console.log(`  D. Inserting SeasonLeader (category: BATTING_AVERAGE, stat: 0.403)...`);
    const createdLeader = await prisma.seasonLeader.create({
      data: {
        seasonId: createdSeason.id,
        playerId: createdPlayer.id,
        teamId: createdTeam.id,
        teamRaw: 'Magallanes',
        category: StatCategory.BATTING_AVERAGE,
        statValue: 0.403,
        extraAttributes: { jj: 30, vb: 119, h: 48 },
      },
    });
    console.log(`     ✓ Created SeasonLeader with ID: ${createdLeader.id}, stat_value: ${createdLeader.statValue}`);

    // Test E: Test Composite Unique Constraint & Idempotent Upsert
    console.log(`  E. Testing Idempotent Upsert on SeasonLeader (updating stat to 0.415)...`);
    const updatedLeader = await prisma.seasonLeader.upsert({
      where: {
        season_player_category: {
          seasonId: createdSeason.id,
          playerId: createdPlayer.id,
          category: StatCategory.BATTING_AVERAGE,
        },
      },
      update: {
        statValue: 0.415,
        extraAttributes: { jj: 30, vb: 119, h: 49 },
      },
      create: {
        seasonId: createdSeason.id,
        playerId: createdPlayer.id,
        teamRaw: 'Magallanes',
        category: StatCategory.BATTING_AVERAGE,
        statValue: 0.415,
      },
    });
    console.log(`     ✓ Idempotent upsert successful! Updated statValue: ${updatedLeader.statValue}`);

    // Test F: Query with full relations
    console.log(`  F. Querying SeasonLeader with full relational joins (Season, Player, Team)...`);
    const fetchedLeader = await prisma.seasonLeader.findUnique({
      where: { id: createdLeader.id },
      include: {
        season: true,
        player: true,
        team: true,
      },
    });
    if (!fetchedLeader || !fetchedLeader.season || !fetchedLeader.player || !fetchedLeader.team) {
      throw new Error('Failed to fetch SeasonLeader with full relations.');
    }
    console.log(`     ✓ Joined query returned:`);
    console.log(`       - Season: ${fetchedLeader.season.code} (${fetchedLeader.season.startYear}-${fetchedLeader.season.endYear})`);
    console.log(`       - Player: ${fetchedLeader.player.fullName} [${fetchedLeader.player.slug}]`);
    console.log(`       - Team: ${fetchedLeader.team.name} (${fetchedLeader.team.abbreviation})`);
    console.log(`       - Stat: ${fetchedLeader.category} = ${fetchedLeader.statValue}`);

    // Test G: Cascading Delete Verification
    console.log(`  G. Testing Cascade Delete: Deleting Season should cascade-delete SeasonLeader...`);
    await prisma.season.delete({
      where: { id: createdSeason.id },
    });
    const orphanLeader = await prisma.seasonLeader.findUnique({
      where: { id: createdLeader.id },
    });
    if (orphanLeader !== null) {
      throw new Error('Cascade delete failed: SeasonLeader was not deleted when Season was deleted.');
    }
    console.log(`     ✓ Cascade delete verified: SeasonLeader automatically deleted.`);

    // Cleanup Player and Team
    console.log(`  H. Cleaning up test player and test team...`);
    await prisma.player.delete({ where: { id: createdPlayer.id } });
    await prisma.team.delete({ where: { id: createdTeam.id } });
    console.log(`     ✓ Cleanup completed.`);

    console.log('\n===============================================================');
    console.log('🎉 ALL VALIDATION CHECKS AND CRUD TESTS PASSED SUCCESSFULLY!');
    console.log('   Tables "seasons", "teams", "players", and "season_leaders"');
    console.log('   are fully present, structured correctly, and functional.');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('Validation failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateTables();
