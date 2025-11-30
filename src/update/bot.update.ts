import { Update, Start, On, Ctx, Message } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { StatsService } from './../stats/stats.service';

@Update()
export class BotUpdate {
  constructor(
    private readonly tiktokService: TikTokService,
    private readonly statsService: StatsService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      '👋 TikTok linkini göndər, mən sənə watermark-sız videonu atım!',
    );
  }

  @On('text')
  async onText(@Ctx() ctx: Context, @Message('text') url: string) {
    if (!url.includes('tiktok.com')) {
      return ctx.reply('❌ Zəhmət olmasa TikTok linki göndər');
    }

    await ctx.reply('⏳ Videonu yükləyirəm, gözlə...');

    try {
      const { videoBuffer, username } = await this.tiktokService.getVideo(url);

      const telegramUser = ctx.from;
      this.statsService.logDownload(
        url,
        username,
        telegramUser?.id,
        telegramUser?.username,
      );

      await ctx.replyWithVideo({ source: videoBuffer });
    } catch (err) {
      await ctx.reply('❌ Videonu yükləməkdə problem oldu, başqa link göndər');
      console.log(err);
    }
  }
}
