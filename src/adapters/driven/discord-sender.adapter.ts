import { AttachmentBuilder, Client, TextChannel } from "discord.js";
import type { GeneratedMessage } from "@domain/entities/generated-message";
import type { SendResponsePort } from "@ports/output/send-response.port";

/**
 * Discord Sender Adapter - Sends messages to Discord channels
 * Implements SendResponsePort interface
 */
export class DiscordSenderAdapter implements SendResponsePort {
    constructor(private readonly client: Client) { }

    async send(channelId: string, message: GeneratedMessage): Promise<void> {
        const channel = await this.client.channels.fetch(channelId);

        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Channel ${channelId} not found or not a text channel`);
        }

        const files: AttachmentBuilder[] = [];

        if (message.image) {
            files.push(
                new AttachmentBuilder(message.image, { name: "generated-image.png" })
            );
        }

        await channel.send({
            content: message.text,
            files,
        });
    }
}
