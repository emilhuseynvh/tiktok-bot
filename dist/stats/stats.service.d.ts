export interface VideoDownload {
    id: number;
    url: string;
    username?: string;
    telegramUserId?: number;
    telegramUsername?: string;
    downloadedAt: string;
}
export interface StatsData {
    totalDownloads: number;
    downloads: VideoDownload[];
}
export declare class StatsService {
    private readonly dataPath;
    private readData;
    private writeData;
    logDownload(url: string, tiktokUsername?: string, telegramUserId?: number, telegramUsername?: string): void;
    getStats(): StatsData;
    getTotalDownloads(): number;
    getRecentDownloads(limit?: number): VideoDownload[];
}
