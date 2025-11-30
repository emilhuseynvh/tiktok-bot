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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const tiktok_service_1 = require("./../service/tiktok.service");
let BotUpdate = class BotUpdate {
    tiktokService;
    constructor(tiktokService) {
        this.tiktokService = tiktokService;
    }
    async start(ctx) {
        await ctx.reply('👋 TikTok linkini göndər, mən sənə watermark-sız videonu atım!');
    }
    async onText(ctx, url) {
        if (!url.includes('tiktok.com')) {
            return ctx.reply('❌ Zəhmət olmasa TikTok linki göndər');
        }
        await ctx.reply('⏳ Videonu yükləyirəm, gözlə...');
        try {
            const videoBuffer = await this.tiktokService.getVideo(url);
            await ctx.replyWithVideo({ source: videoBuffer });
        }
        catch (err) {
            await ctx.reply('❌ Videonu yükləməkdə problem oldu, başqa link göndər');
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
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __param(1, (0, nestjs_telegraf_1.Message)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context, String]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onText", null);
exports.BotUpdate = BotUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [tiktok_service_1.TikTokService])
], BotUpdate);
//# sourceMappingURL=bot.update.js.map