import { Update, Start, On, Ctx, Message, Command, InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { InstagramService } from './../service/instagram.service';
import { StatsService } from './../stats/stats.service';
import config from './../config';

@Update()
export class BotUpdate {
  private broadcastMessage: string | null = null;

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
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

  @Command('broadcast')
  async broadcast(@Ctx() ctx: Context) {
    if (ctx.from?.id !== config.adminId) {
      return ctx.reply('❌ Bu əmri yalnız admin istifadə edə bilər');
    }

    this.broadcastMessage = 'waiting';
    await ctx.reply('📝 Bütün istifadəçilərə göndərmək istədiyiniz mesajı yazın:');
  }

  @Command('stats')
  async stats(@Ctx() ctx: Context) {
    if (ctx.from?.id !== config.adminId) {
      return ctx.reply('❌ Bu əmri yalnız admin istifadə edə bilər');
    }

    const userIds = this.statsService.getAllUserIds();
    const totalDownloads = this.statsService.getTotalDownloads();

    await ctx.reply(
      `📊 Statistika:\n\n` +
      `👥 Ümumi istifadəçi: ${userIds.length}\n` +
      `📥 Ümumi yükləmə: ${totalDownloads}`
    );
  }

  @On('text')
  async onText(@Ctx() ctx: Context, @Message('text') text: string) {
    // Broadcast rejimindəyiksə
    if (this.broadcastMessage === 'waiting' && ctx.from?.id === config.adminId) {
      this.broadcastMessage = null;
      const userIds = this.statsService.getAllUserIds();

      await ctx.reply(`📤 ${userIds.length} istifadəçiyə mesaj göndərilir...`);

      let sent = 0;
      let failed = 0;

      for (const userId of userIds) {
        try {
          await this.bot.telegram.sendMessage(userId, text);
          sent++;
        } catch {
          failed++;
        }
      }

      return ctx.reply(`✅ Göndərildi: ${sent}\n❌ Uğursuz: ${failed}`);
    }

    const isTikTok = text.includes('tiktok.com');
    const isInstagram = text.includes('instagram.com');

    if (!isTikTok && !isInstagram) {
      return ctx.reply('❌ Zəhmət olmasa TikTok və ya Instagram linki göndər');
    }

    await ctx.reply('⏳ Yükləyirəm, gözlə...');

    const telegramUser = ctx.from;

    try {
      if (isTikTok) {
        const { videoBuffer, username } = await this.tiktokService.getVideo(text);

        this.statsService.logDownload(
          text,
          'tiktok',
          username,
          telegramUser?.id,
          telegramUser?.username,
        );

        await ctx.replyWithVideo({ source: videoBuffer });
      } else {
        const { type, buffer, username } = await this.instagramService.getMedia(text);

        this.statsService.logDownload(
          text,
          'instagram',
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
