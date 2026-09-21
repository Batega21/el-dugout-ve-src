import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness & Readiness probe for Cloud Run' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    return this.health.check([
      // Memory check: heap should not exceed 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Database check: quick ping to PostgreSQL
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error) {
          return {
            database: {
              status: 'down',
              message: error.message,
            },
          };
        }
      },
    ]);
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'System Health Matrix & Metrics Reporting (Admin only)' })
  @ApiResponse({ status: 200, description: 'System performance and business telemetry' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  async getMetrics() {
    const memory = process.memoryUsage();
    const [userCount, subscriptionCount, subscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count(),
      this.prisma.subscription.findMany({ select: { plan: true, status: true } }),
    ]);

    const byTier: Record<string, number> = { FREE: 0, BASIC: 0, PREMIUM: 0 };
    let activeSubscriptions = 0;
    for (const sub of subscriptions) {
      byTier[sub.plan] = (byTier[sub.plan] || 0) + 1;
      if (sub.status === 'ACTIVE' || sub.status === 'TRIALING') {
        activeSubscriptions++;
      }
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        nodeVersion: process.version,
        platform: process.platform,
      },
      businessTelemetry: {
        totalUsers: userCount,
        totalSubscriptions: subscriptionCount,
        activeSubscriptions,
        subscriptionsByTier: byTier,
      },
    };
  }
}
