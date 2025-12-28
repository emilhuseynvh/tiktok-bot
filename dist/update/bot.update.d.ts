import { Context, Telegraf } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { InstagramService } from './../service/instagram.service';
import { StatsService } from './../stats/stats.service';
export declare class BotUpdate {
    private readonly bot;
    private readonly tiktokService;
    private readonly instagramService;
    private readonly statsService;
    private broadcastMessage;
    private pendingDownloads;
    constructor(bot: Telegraf<Context>, tiktokService: TikTokService, instagramService: InstagramService, statsService: StatsService);
    start(ctx: Context): Promise<void>;
    broadcast(ctx: Context): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
    stats(ctx: Context): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
    onText(ctx: Context, text: string): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
    onDownloadVideo(ctx: Context): Promise<void>;
    onDownloadAudio(ctx: Context): Promise<void>;
    private handleDownload;
}
