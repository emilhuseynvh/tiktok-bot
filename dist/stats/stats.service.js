"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let StatsService = class StatsService {
    dataPath = path.join(process.cwd(), 'data', 'downloads.json');
    readData() {
        try {
            if (fs.existsSync(this.dataPath)) {
                const data = fs.readFileSync(this.dataPath, 'utf-8');
                return JSON.parse(data);
            }
        }
        catch (error) {
            console.error('Error reading stats file:', error);
        }
        return { totalDownloads: 0, downloads: [] };
    }
    writeData(data) {
        try {
            const dir = path.dirname(this.dataPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Error writing stats file:', error);
        }
    }
    logDownload(url, type, contentUsername, telegramUserId, telegramUsername) {
        const data = this.readData();
        const newDownload = {
            id: data.totalDownloads + 1,
            url,
            type,
            username: contentUsername,
            telegramUserId,
            telegramUsername,
            downloadedAt: new Date().toISOString(),
        };
        data.downloads.push(newDownload);
        data.totalDownloads++;
        this.writeData(data);
    }
    getStats() {
        return this.readData();
    }
    getTotalDownloads() {
        return this.readData().totalDownloads;
    }
    getRecentDownloads(limit = 10) {
        const data = this.readData();
        return data.downloads.slice(-limit).reverse();
    }
    getAllUserIds() {
        const data = this.readData();
        const userIds = new Set();
        for (const download of data.downloads) {
            if (download.telegramUserId) {
                userIds.add(download.telegramUserId);
            }
        }
        return Array.from(userIds);
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)()
], StatsService);
//# sourceMappingURL=stats.service.js.map