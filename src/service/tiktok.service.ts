import { Injectable } from '@nestjs/common';
import { Downloader } from '@tobyg74/tiktok-api-dl';
import axios from 'axios';

@Injectable()
export class TikTokService {
  async getVideo(url: string): Promise<Buffer> {
    const data = await Downloader(url, { version: 'v3' });

    const videoUrl = data.result?.videoHD || data.result?.videoSD;

    if (!videoUrl) {
      throw new Error('Video URL tapılmadı');
    }

    const video = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(video.data);
  }
}