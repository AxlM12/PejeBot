import type { AIPort, AIResult } from "@ports/output/ai.port";

/**
 * Fallback AI Adapter - Used when no API key is provided
 * Returns a static message indicating configuration is missing
 */
export class FallbackAIAdapter implements AIPort {
    async generatePhrase(prompt: string, language: string): Promise<AIResult> {
        const isSpanish = language === "es";

        // Extract topic roughly from prompt for better fallback message (optional but nice)
        // Since we don't have the clean topic anymore, we can just say "your request"

        return {
            phrase: isSpanish
                ? `[INFO] No hay proveedor de IA configurado. Por favor añade OPENROUTER_API_KEY a tu archivo .env.`
                : `[INFO] No AI provider configured. Please add OPENROUTER_API_KEY to your .env file.`,
            // Provide a generic prompt so image generation still works with something meaningful
            imagePrompt: `A conceptual representation of code configuration, minimalist style`
        };
    }
}
