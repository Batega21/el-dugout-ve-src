import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [LeaderboardsModule, DatabaseModule],
  controllers: [ImportsController],
})
export class ImportsModule {}
