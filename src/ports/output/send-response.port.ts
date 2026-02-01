import type { GeneratedMessage } from "@domain/entities/generated-message";

/**
 * Output Port - Send response to a channel
 */
export interface SendResponsePort {
    send(channelId: string, message: GeneratedMessage): Promise<void>;
}
