import type { GenerateRequest } from "@domain/entities/generate-request";
import { GeneratedMessage } from "@domain/entities/generated-message";
import type { GenerateMessagePort } from "@ports/input/generate-message.port";
import type { AIPort } from "@ports/output/ai.port";
import type { ImagePort } from "@ports/output/image.port";
import type { SendResponsePort } from "@ports/output/send-response.port";

/**
 * Domain Service - Orchestrates message generation
 * Depends ONLY on ports, never on concrete adapters
 */
export class MessageGeneratorService implements GenerateMessagePort {
    constructor(
        private readonly ai: AIPort,
        private readonly image: ImagePort,
        private readonly sender: SendResponsePort
    ) { }

    async generate(request: GenerateRequest): Promise<void> {
        // 1. Build the prompt (Business Logic)
        const prompt = this.buildPrompt(request.topic, request.type, request.language);

        // 2. Generate phrase via AI
        const aiResult = await this.ai.generatePhrase(prompt, request.language);

        // 3. Get image if requested
        let imageBuffer: Buffer | undefined;
        if (request.includeImage) {
            imageBuffer = await this.image.getImage(aiResult.imagePrompt);
        }

        // 4. Build result entity
        const message = new GeneratedMessage(aiResult.phrase, imageBuffer, {
            type: request.type,
            topic: request.topic,
        });

        // 5. Send via output port
        await this.sender.send(request.channelId, message);
    }

    private buildPrompt(topic: string, type: string, language: string): string {
        const isSpanish = language === "es";

        const typeInstructions: Record<string, string> = isSpanish ? {
            phrase: `Escribe una frase corta e inspiradora sobre "${topic}"`,
            poem: `Escribe un poema corto de 4 líneas sobre "${topic}"`,
            haiku: `Escribe un haiku sobre "${topic}"`,
        } : {
            phrase: `Write a short, inspiring phrase about "${topic}"`,
            poem: `Write a short 4-line poem about "${topic}"`,
            haiku: `Write a haiku about "${topic}"`,
        };

        const imageInstruction = isSpanish
            ? "También proporciona un prompt descriptivo en inglés para generar una imagen que coincida con la frase."
            : "Also provide a descriptive prompt for generating an image that matches the phrase.";

        return `${typeInstructions[type] || typeInstructions.phrase}. 
${imageInstruction}
Respond in JSON format: { "phrase": "your phrase here", "imagePrompt": "image description in English" }`;
    }
}
