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
exports.InstagramService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const snapsave = require('../helpers/index');
let InstagramService = class InstagramService {
    async getMedia(url) {
        const result = await snapsave(url);
        console.log('Snapsave response:', JSON.stringify(result, null, 2));
        if (!result || !result.status || !result.data?.length) {
            throw new Error(result?.msg || 'Instagram media tapılmadı');
        }
        const media = result.data[0];
        const mediaUrl = media.url;
        if (!mediaUrl) {
            throw new Error('Instagram media URL tapılmadı');
        }
        const isVideo = mediaUrl.includes('.mp4') || media.thumbnail;
        const mediaResponse = await axios_1.default.get(mediaUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
        return {
            type: isVideo ? 'video' : 'image',
            buffer: Buffer.from(mediaResponse.data),
            username: undefined,
        };
    }
};
exports.InstagramService = InstagramService;
exports.InstagramService = InstagramService = __decorate([
    (0, common_1.Injectable)()
], InstagramService);
//# sourceMappingURL=instagram.service.js.map