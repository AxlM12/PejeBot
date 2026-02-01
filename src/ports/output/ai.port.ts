/**
 * Result from AI provider
 */
export interface AIResult {
    phrase: string;
    imagePrompt: string;
}

/**
 * Output Port - AI phrase generation
 */
export interface AIPort {
    /**
     * Generate a phrase based on a pre-constructed prompt
     * @param prompt The full user/system prompt
     * @param language 'es' or 'en' (used for system instructions)
     */
    generatePhrase(prompt: string, language: string): Promise<AIResult>;
}
