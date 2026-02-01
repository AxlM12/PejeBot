/**
 * Request DTO for message generation
 */
export interface GenerateRequest {
    topic: string;
    type: "phrase" | "poem" | "haiku";
    includeImage: boolean;
    channelId: string;
    language: "es" | "en";
}
