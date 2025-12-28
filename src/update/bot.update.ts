import { Update, Start, On, Ctx, Message, Command, InjectBot, Action } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { TikTokService } from './../service/tiktok.service';
import { InstagramService } from './../service/instagram.service';
import { StatsService } from './../stats/stats.service';
import config from './../config';

interface PendingDownload {
  url: string;
  type: 'tiktok' | 'instagram';
  messageId: number;
}

@Update()
export class BotUpdate {
  private broadcastMessage: string | null = null;
  private pendingDownloads: Map<number, PendingDownload> = new Map();

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

    const userId = ctx.from?.id;
    if (!userId) return;

    // Seçim buttonları göstər
    const msg = await ctx.reply(
      '📥 Necə yükləmək istəyirsən?',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🎬 Video', 'download_video'),
          Markup.button.callback('🎵 Audio', 'download_audio'),
        ],
      ]),
    );

    // URL-i saxla
    this.pendingDownloads.set(userId, {
      url: text,
      type: isTikTok ? 'tiktok' : 'instagram',
      messageId: msg.message_id,
    });
  }

  @Action('download_video')
  async onDownloadVideo(@Ctx() ctx: Context) {
    await this.handleDownload(ctx, 'video');
  }

  @Action('download_audio')
  async onDownloadAudio(@Ctx() ctx: Context) {
    await this.handleDownload(ctx, 'audio');
  }

  private async handleDownload(ctx: Context, format: 'video' | 'audio') {
    const userId = ctx.from?.id;
    if (!userId) return;

    const pending = this.pendingDownloads.get(userId);
    if (!pending) {
      await ctx.answerCbQuery('❌ Link tapılmadı, yenidən göndər');
      return;
    }

    this.pendingDownloads.delete(userId);

    // Buttonları sil və status göstər
    await ctx.editMessageText('⏳ Yükləyirəm, gözlə...');

    const shareButton = Markup.inlineKeyboard([
      [Markup.button.switchToChat('📢 Dostlarınla paylaş', 'Bu botla TikTok və Instagram videolarını yüklə! 👉 @apasni_tiktok_bot')],
    ]);

    try {
      if (pending.type === 'tiktok') {
        const { videoBuffer, username } = await this.tiktokService.getVideo(pending.url);

        if (format === 'video') {
          await ctx.replyWithVideo({ source: videoBuffer }, shareButton);
        } else {
          await ctx.replyWithAudio({ source: videoBuffer, filename: 'audio.mp3' }, shareButton);
        }

        this.statsService.logDownload(
          pending.url,
          'tiktok',
          format,
          true,
          username,
          userId,
          ctx.from?.username,
        );
      } else {
        const { type, buffer, username } = await this.instagramService.getMedia(pending.url);

        if (type === 'image') {
          await ctx.replyWithPhoto({ source: buffer }, shareButton);
        } else if (format === 'video') {
          await ctx.replyWithVideo({ source: buffer }, shareButton);
        } else {
          await ctx.replyWithAudio({ source: buffer, filename: 'audio.mp3' }, shareButton);
        }

        this.statsService.logDownload(
          pending.url,
          'instagram',
          type === 'image' ? 'video' : format,
          true,
          username,
          userId,
          ctx.from?.username,
        );
      }

      await ctx.deleteMessage(pending.messageId).catch(() => {});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await ctx.editMessageText(`❌ Xəta: ${errorMessage}`);

      this.statsService.logDownload(
        pending.url,
        pending.type,
        format,
        false,
        undefined,
        userId,
        ctx.from?.username,
      );

      console.log(err);
    }
  }
}
