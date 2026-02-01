/**
 * Output Port - Image generation/fetching
 */
export interface ImagePort {
    getImage(prompt: string): Promise<Buffer>;
}
