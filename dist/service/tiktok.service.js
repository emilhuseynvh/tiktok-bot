"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokService = void 0;
const common_1 = require("@nestjs/common");
const tiktok_api_dl_1 = require("@tobyg74/tiktok-api-dl");
const axios_1 = __importDefault(require("axios"));
let TikTokService = class TikTokService {
    async getVideo(url) {
        const data = await (0, tiktok_api_dl_1.Downloader)(url, { version: 'v3' });
        const videoUrl = data.result?.videoHD || data.result?.videoSD;
        if (!videoUrl) {
            throw new Error('Video URL tapılmadı');
        }
        const video = await axios_1.default.get(videoUrl, {
            responseType: 'arraybuffer',
        });
        return Buffer.from(video.data);
    }
};
exports.TikTokService = TikTokService;
exports.TikTokService = TikTokService = __decorate([
    (0, common_1.Injectable)()
], TikTokService);
//# sourceMappingURL=tiktok.service.js.map