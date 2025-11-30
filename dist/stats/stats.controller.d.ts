import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getStats(): import("./stats.service").StatsData;
    getTotalDownloads(): {
        totalDownloads: number;
    };
    getRecentDownloads(limit?: string): import("./stats.service").VideoDownload[];
}
