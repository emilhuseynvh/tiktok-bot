import { Update, Start, On, Ctx, Message } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { InstagramService } from './../service/instagram.service';
import { StatsService } from './../stats/stats.service';

@Update()
export class BotUpdate {
  constructor(
    private readonly tiktokService: TikTokService,
    private readonly instagramService: InstagramService,
    private readonly statsService: StatsService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      '👋 TikTok və ya Instagram linkini göndər, mən sənə videonu/şəkli atım!',
    );
  }

  @On('text')
  async onText(@Ctx() ctx: Context, @Message('text') url: string) {
    const isTikTok = url.includes('tiktok.com');
    const isInstagram = url.includes('instagram.com');

    if (!isTikTok && !isInstagram) {
      return ctx.reply('❌ Zəhmət olmasa TikTok və ya Instagram linki göndər');
    }

    await ctx.reply('⏳ Yükləyirəm, gözlə...');

    const telegramUser = ctx.from;

    try {
      if (isTikTok) {
        const { videoBuffer, username } = await this.tiktokService.getVideo(url);

        this.statsService.logDownload(
          url,
          username,
          telegramUser?.id,
          telegramUser?.username,
        );

        await ctx.replyWithVideo({ source: videoBuffer });
      } else {
        const { type, buffer, username } = await this.instagramService.getMedia(url);

        this.statsService.logDownload(
          url,
          username,
          telegramUser?.id,
          telegramUser?.username,
        );

        if (type === 'video') {
          await ctx.replyWithVideo({ source: buffer });
        } else {
          await ctx.replyWithPhoto({ source: buffer });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await ctx.reply(`❌ Xəta: ${errorMessage}`);
      console.log(err);
    }
  }
}
