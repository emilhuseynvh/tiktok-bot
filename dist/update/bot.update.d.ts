import { Context } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { StatsService } from './../stats/stats.service';
export declare class BotUpdate {
    private readonly tiktokService;
    private readonly statsService;
    constructor(tiktokService: TikTokService, statsService: StatsService);
    start(ctx: Context): Promise<void>;
    onText(ctx: Context, url: string): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
}
