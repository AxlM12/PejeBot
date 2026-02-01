import type { GenerateRequest } from "@domain/entities/generate-request";

/**
 * Input Port - How triggers invoke message generation
 */
export interface GenerateMessagePort {
    generate(request: GenerateRequest): Promise<void>;
}
