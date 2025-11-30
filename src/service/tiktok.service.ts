import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface TikTokVideoData {
  videoBuffer: Buffer;
  username?: string;
}

@Injectable()
export class TikTokService {
  async getVideo(url: string): Promise<TikTokVideoData> {
    const response = await axios.get(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
    );

    const data = response.data;

    if (data.code !== 0 || !data.data?.play) {
      throw new Error('Video URL tapılmadı');
    }

    const videoUrl = data.data.hdplay || data.data.play;
    const username = data.data.author?.unique_id || data.data.author?.nickname;

    const video = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });

    return {
      videoBuffer: Buffer.from(video.data),
      username,
    };
  }
}