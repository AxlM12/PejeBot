import type { ImagePort } from "@ports/output/image.port";

/**
 * Pollinations Image Adapter - Free AI image generation
 * Implements ImagePort interface
 */
export class PollinationsAdapter implements ImagePort {
    private readonly baseUrl = "https://image.pollinations.ai/prompt";

    async getImage(prompt: string): Promise<Buffer> {
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `${this.baseUrl}/${encodedPrompt}?width=512&height=512&nologo=true`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}
