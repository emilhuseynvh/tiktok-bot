import { Context } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
export declare class BotUpdate {
    private readonly tiktokService;
    constructor(tiktokService: TikTokService);
    start(ctx: Context): Promise<void>;
    onText(ctx: Context, url: string): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
}
