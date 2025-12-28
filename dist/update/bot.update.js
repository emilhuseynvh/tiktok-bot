"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const tiktok_service_1 = require("./../service/tiktok.service");
const instagram_service_1 = require("./../service/instagram.service");
const stats_service_1 = require("./../stats/stats.service");
const config_1 = __importDefault(require("./../config"));
let BotUpdate = class BotUpdate {
    bot;
    tiktokService;
    instagramService;
    statsService;
    broadcastMessage = null;
    pendingDownloads = new Map();
    constructor(bot, tiktokService, instagramService, statsService) {
        this.bot = bot;
        this.tiktokService = tiktokService;
        this.instagramService = instagramService;
        this.statsService = statsService;
    }
    async start(ctx) {
        await ctx.reply('👋 TikTok və ya Instagram linkini göndər, mən sənə videonu/şəkli atım!');
    }
    async broadcast(ctx) {
        if (ctx.from?.id !== config_1.default.adminId) {
            return ctx.reply('❌ Bu əmri yalnız admin istifadə edə bilər');
        }
        this.broadcastMessage = 'waiting';
        await ctx.reply('📝 Bütün istifadəçilərə göndərmək istədiyiniz mesajı yazın:');
    }
    async stats(ctx) {
        if (ctx.from?.id !== config_1.default.adminId) {
            return ctx.reply('❌ Bu əmri yalnız admin istifadə edə bilər');
        }
        const userIds = this.statsService.getAllUserIds();
        const totalDownloads = this.statsService.getTotalDownloads();
        await ctx.reply(`📊 Statistika:\n\n` +
            `👥 Ümumi istifadəçi: ${userIds.length}\n` +
            `📥 Ümumi yükləmə: ${totalDownloads}`);
    }
    async onText(ctx, text) {
        if (this.broadcastMessage === 'waiting' && ctx.from?.id === config_1.default.adminId) {
            this.broadcastMessage = null;
            const userIds = this.statsService.getAllUserIds();
            await ctx.reply(`📤 ${userIds.length} istifadəçiyə mesaj göndərilir...`);
            let sent = 0;
            let failed = 0;
            for (const userId of userIds) {
                try {
                    await this.bot.telegram.sendMessage(userId, text);
                    sent++;
                }
                catch {
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
        if (!userId)
            return;
        const msg = await ctx.reply('📥 Necə yükləmək istəyirsən?', telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('🎬 Video', 'download_video'),
                telegraf_1.Markup.button.callback('🎵 Audio', 'download_audio'),
            ],
        ]));
        this.pendingDownloads.set(userId, {
            url: text,
            type: isTikTok ? 'tiktok' : 'instagram',
            messageId: msg.message_id,
        });
    }
    async onDownloadVideo(ctx) {
        await this.handleDownload(ctx, 'video');
    }
    async onDownloadAudio(ctx) {
        await this.handleDownload(ctx, 'audio');
    }
    async handleDownload(ctx, format) {
        const userId = ctx.from?.id;
        if (!userId)
            return;
        const pending = this.pendingDownloads.get(userId);
        if (!pending) {
            await ctx.answerCbQuery('❌ Link tapılmadı, yenidən göndər');
            return;
        }
        this.pendingDownloads.delete(userId);
        await ctx.editMessageText('⏳ Yükləyirəm, gözlə...');
        const shareButton = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.switchToChat('📢 Dostlarınla paylaş', 'Bu botla TikTok və Instagram videolarını yüklə! 👉 @apasni_tiktok_bot')],
        ]);
        try {
            if (pending.type === 'tiktok') {
                const { videoBuffer, username } = await this.tiktokService.getVideo(pending.url);
                if (format === 'video') {
                    await ctx.replyWithVideo({ source: videoBuffer }, shareButton);
                }
                else {
                    await ctx.replyWithAudio({ source: videoBuffer, filename: 'audio.mp3' }, shareButton);
                }
                this.statsService.logDownload(pending.url, 'tiktok', format, true, username, userId, ctx.from?.username);
            }
            else {
                const { type, buffer, username } = await this.instagramService.getMedia(pending.url);
                if (type === 'image') {
                    await ctx.replyWithPhoto({ source: buffer }, shareButton);
                }
                else if (format === 'video') {
                    await ctx.replyWithVideo({ source: buffer }, shareButton);
                }
                else {
                    await ctx.replyWithAudio({ source: buffer, filename: 'audio.mp3' }, shareButton);
                }
                this.statsService.logDownload(pending.url, 'instagram', type === 'image' ? 'video' : format, true, username, userId, ctx.from?.username);
            }
            await ctx.deleteMessage(pending.messageId).catch(() => { });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            await ctx.editMessageText(`❌ Xəta: ${errorMessage}`);
            this.statsService.logDownload(pending.url, pending.type, format, false, undefined, userId, ctx.from?.username);
            console.log(err);
        }
    }
};
exports.BotUpdate = BotUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "start", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('broadcast'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "broadcast", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('stats'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "stats", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __param(1, (0, nestjs_telegraf_1.Message)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context, String]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('download_video'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDownloadVideo", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('download_audio'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDownloadAudio", null);
exports.BotUpdate = BotUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        tiktok_service_1.TikTokService,
        instagram_service_1.InstagramService,
        stats_service_1.StatsService])
], BotUpdate);
//# sourceMappingURL=bot.update.js.map