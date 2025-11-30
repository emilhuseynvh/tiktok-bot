export interface TikTokVideoData {
    videoBuffer: Buffer;
    username?: string;
}
export declare class TikTokService {
    getVideo(url: string): Promise<TikTokVideoData>;
}
