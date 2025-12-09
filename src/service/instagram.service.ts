import { Injectable } from '@nestjs/common';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const snapsave = require('../helpers/index');

export interface InstagramMediaData {
  type: 'video' | 'image';
  buffer: Buffer;
  username?: string;
}

@Injectable()
export class InstagramService {
  async getMedia(url: string): Promise<InstagramMediaData> {
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

    const mediaResponse = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    return {
      type: isVideo ? 'video' : 'image',
      buffer: Buffer.from(mediaResponse.data),
      username: undefined,
    };
  }
}
