import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface VideoDownload {
  id: number;
  url: string;
  username?: string;
  telegramUserId?: number;
  telegramUsername?: string;
  downloadedAt: string;
}

export interface StatsData {
  totalDownloads: number;
  downloads: VideoDownload[];
}

@Injectable()
export class StatsService {
  private readonly dataPath = path.join(process.cwd(), 'data', 'downloads.json');

  private readData(): StatsData {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading stats file:', error);
    }
    return { totalDownloads: 0, downloads: [] };
  }

  private writeData(data: StatsData): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing stats file:', error);
    }
  }

  logDownload(
    url: string,
    tiktokUsername?: string,
    telegramUserId?: number,
    telegramUsername?: string,
  ): void {
    const data = this.readData();
    const newDownload: VideoDownload = {
      id: data.totalDownloads + 1,
      url,
      username: tiktokUsername,
      telegramUserId,
      telegramUsername,
      downloadedAt: new Date().toISOString(),
    };
    data.downloads.push(newDownload);
    data.totalDownloads++;
    this.writeData(data);
  }

  getStats(): StatsData {
    return this.readData();
  }

  getTotalDownloads(): number {
    return this.readData().totalDownloads;
  }

  getRecentDownloads(limit = 10): VideoDownload[] {
    const data = this.readData();
    return data.downloads.slice(-limit).reverse();
  }

  getAllUserIds(): number[] {
    const data = this.readData();
    const userIds = new Set<number>();
    for (const download of data.downloads) {
      if (download.telegramUserId) {
        userIds.add(download.telegramUserId);
      }
    }
    return Array.from(userIds);
  }
}
