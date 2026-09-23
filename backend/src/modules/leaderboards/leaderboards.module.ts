import { Module } from '@nestjs/common';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardImportService } from './leaderboard-import.service';

@Module({
  controllers: [LeaderboardsController],
  providers: [LeaderboardImportService],
  exports: [LeaderboardImportService],
})
export class LeaderboardsModule {}
