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
const axios_1 = __importDefault(require("axios"));
let TikTokService = class TikTokService {
    async getVideo(url) {
        const response = await axios_1.default.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = response.data;
        if (data.code !== 0 || !data.data?.play) {
            throw new Error('Video URL tapılmadı');
        }
        const videoUrl = data.data.hdplay || data.data.play;
        const username = data.data.author?.unique_id || data.data.author?.nickname;
        const video = await axios_1.default.get(videoUrl, {
            responseType: 'arraybuffer',
        });
        return {
            videoBuffer: Buffer.from(video.data),
            username,
        };
    }
};
exports.TikTokService = TikTokService;
exports.TikTokService = TikTokService = __decorate([
    (0, common_1.Injectable)()
], TikTokService);
//# sourceMappingURL=tiktok.service.js.map