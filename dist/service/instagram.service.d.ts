export interface InstagramMediaData {
    type: 'video' | 'image';
    buffer: Buffer;
    username?: string;
}
export declare class InstagramService {
    getMedia(url: string): Promise<InstagramMediaData>;
}
