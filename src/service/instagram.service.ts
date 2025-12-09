import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { instagramGetUrl } from 'instagram-url-direct';

export interface InstagramMediaData {
  type: 'video' | 'image';
  buffer: Buffer;
  username?: string;
}

@Injectable()
export class InstagramService {
  async getMedia(url: string): Promise<InstagramMediaData> {
    const data = await instagramGetUrl(url);
    console.log('Instagram response:', JSON.stringify(data, null, 2));

    if (!data || !data.url_list || data.url_list.length === 0) {
      throw new Error('Instagram media tapılmadı');
    }

    const mediaUrl = data.url_list[0];
    const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');

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
