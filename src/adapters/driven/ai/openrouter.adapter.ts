import type { AIPort, AIResult } from "@ports/output/ai.port";
import { OpenRouter } from "@openrouter/sdk";

export class OpenRouterAdapter implements AIPort {
    private readonly client: OpenRouter;
    private readonly freeModels = [
        // Set the ai models here, will likely change it to be injected from env
        "deepseek/deepseek-r1-0528:free",
        "meta-llama/llama-3.3-70b-instruct:free",
    ];

    constructor(apiKey: string) {
        this.client = new OpenRouter({
            apiKey: apiKey,
            httpReferer: "https://github.com/pejebot",
            xTitle: "PejeBot"
        });
    }

    async generatePhrase(prompt: string, language: string): Promise<AIResult> {
        const langInstruction = language === "es" ? "Responde en español." : "Respond in English.";

        // Pick a random free model
        const model = this.getRandomFreeModel();
        console.log(`[OpenRouter] Using model: ${model}`);

        try {
            // Using the official SDK method: client.chat.send()
            const completion = await this.client.chat.send({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `You are a creative writer. ${langInstruction} You MUST respond with valid JSON only. Format: { "phrase": "...", "imagePrompt": "..." }`
                    },
                    { role: "user", content: prompt }
                ],
                // OpenRouter/OpenAI SDK often uses camelCase in TS typings
                // If the SDK strictly requires specific properties, we should match them.
                // The hint suggested 'responseFormat'.
                // responseFormat: { type: "json_object" }, 
            });

            // The SDK returns a typed response object
            const message = completion.choices[0]?.message;
            if (!message || !message.content) throw new Error("Empty response from AI");

            // Handle potential multi-modal content (array of parts)
            // Handle potential multi-modal content (array of parts)
            let content = Array.isArray(message.content)
                ? message.content.map(c => 'text' in c ? c.text : '').join('')
                : message.content;

            if (!content) throw new Error("Empty response content");

            // Sanitize: Remove markdown code blocks if present
            // This regex removes ```json at the start and ``` at the end, 
            // and also handles generic ``` blocks.
            content = content.replace(/^```json\s*/g, "").replace(/^```\s*/g, "").replace(/\s*```$/g, "");

            const parsed = JSON.parse(content as string);
            return {
                phrase: parsed.phrase,
                imagePrompt: parsed.imagePrompt,
            };
        } catch (error) {
            console.error(`[OpenRouter] Error with model ${model}:`, error);

            // Fallback logic
            return {
                phrase: language === "es"
                    ? `(Error de IA con ${model}) No pude generar la respuesta.`
                    : `(AI Error with ${model}) Could not generate response.`,
                imagePrompt: "Error"
            };
        }
    }

    private getRandomFreeModel(): string {
        const index = Math.floor(Math.random() * this.freeModels.length);
        return this.freeModels[index];
    }
}
