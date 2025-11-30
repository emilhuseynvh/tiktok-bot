import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TikTokService {
  async getVideo(url: string): Promise<Buffer> {
    const response = await axios.get(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
    );

    const data = response.data;

    if (data.code !== 0 || !data.data?.play) {
      throw new Error('Video URL tapılmadı');
    }

    const videoUrl = data.data.hdplay || data.data.play;

    const video = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(video.data);
  }
}