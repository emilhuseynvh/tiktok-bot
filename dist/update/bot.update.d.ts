import { Context } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { InstagramService } from './../service/instagram.service';
import { StatsService } from './../stats/stats.service';
export declare class BotUpdate {
    private readonly tiktokService;
    private readonly instagramService;
    private readonly statsService;
    constructor(tiktokService: TikTokService, instagramService: InstagramService, statsService: StatsService);
    start(ctx: Context): Promise<void>;
    onText(ctx: Context, url: string): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
}
