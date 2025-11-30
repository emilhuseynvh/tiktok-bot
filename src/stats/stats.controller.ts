import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }

  @Get('total')
  getTotalDownloads() {
    return { totalDownloads: this.statsService.getTotalDownloads() };
  }

  @Get('recent')
  getRecentDownloads(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.statsService.getRecentDownloads(parsedLimit);
  }
}
