import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface InstagramMediaData {
  type: 'video' | 'image';
  buffer: Buffer;
  username?: string;
}

@Injectable()
export class InstagramService {
  async getMedia(url: string): Promise<InstagramMediaData> {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `ig_${Date.now()}`);

    try {
      // yt-dlp ilə yüklə
      const { stdout } = await execAsync(
        `yt-dlp -o "${tempFile}.%(ext)s" --print filename "${url}"`,
        { timeout: 60000 },
      );

      const downloadedFile = stdout.trim();
      console.log('Downloaded file:', downloadedFile);

      if (!fs.existsSync(downloadedFile)) {
        throw new Error('Fayl yüklənmədi');
      }

      const buffer = fs.readFileSync(downloadedFile);
      const isVideo = downloadedFile.endsWith('.mp4') || downloadedFile.endsWith('.webm');

      // Temp faylı sil
      fs.unlinkSync(downloadedFile);

      return {
        type: isVideo ? 'video' : 'image',
        buffer,
        username: undefined,
      };
    } catch (error) {
      // Temp faylları təmizlə
      const files = fs.readdirSync(tempDir).filter(f => f.startsWith('ig_'));
      files.forEach(f => {
        try {
          fs.unlinkSync(path.join(tempDir, f));
        } catch {}
      });

      throw new Error(`Instagram yükləmə xətası: ${error instanceof Error ? error.message : error}`);
    }
  }
}
