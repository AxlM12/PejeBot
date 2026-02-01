import { Client, Events, GatewayIntentBits, Message } from "discord.js";
import type { GenerateRequest } from "@domain/entities/generate-request";
import type { GenerateMessagePort } from "@ports/input/generate-message.port";

/**
 * Discord Handler - Driving adapter that handles mentions
 */
export class DiscordHandler {
    private client: Client;
    private isClientOwner: boolean = false;

    constructor(
        private readonly messageGenerator: GenerateMessagePort,
        existingClient?: Client
    ) {
        if (existingClient) {
            this.client = existingClient;
        } else {
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                ],
            });
            this.isClientOwner = true;
        }

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.client.once(Events.ClientReady, (c) => {
            console.log(`✅ Bot ready! Logged in as ${c.user.tag}`);
        });

        this.client.on(Events.MessageCreate, (message) => {
            this.handleMessage(message);
        });
    }

    private async handleMessage(message: Message): Promise<void> {
        // Ignore bots and messages that don't mention the bot
        if (message.author.bot) return;
        if (!message.mentions.has(this.client.user!)) return;

        // Extract topic from message (remove the mention)
        const topic = message.content
            .replace(/<@!?\d+>/g, "")
            .trim();

        if (!topic) {
            await message.reply("Please provide a topic! Example: `@Bot sunset`");
            return;
        }

        // Parse request type from topic (e.g., "poem:sunset" or just "sunset")
        const { type, cleanTopic, includeImage } = this.parseRequest(topic);

        const request: GenerateRequest = {
            topic: cleanTopic,
            type,
            includeImage, // Default is true, unless specified otherwise
            channelId: message.channelId,
            language: "es",
        };

        try {
            if ("sendTyping" in message.channel) {
                await message.channel.sendTyping();
            }
            await this.messageGenerator.generate(request);
        } catch (error) {
            console.error("Error generating message:", error);
            await message.reply("Sorry, I couldn't generate a message. Please try again.");
        }
    }

    private parseRequest(topic: string): { type: GenerateRequest["type"]; cleanTopic: string; includeImage: boolean } {
        // Check for --no-image flag
        let includeImage = true;
        if (topic.includes("--no-image")) {
            includeImage = false;
            topic = topic.replace("--no-image", "").trim();
        }

        const typeMatch = topic.match(/^(phrase|poem|haiku):\s*(.+)$/i);

        if (typeMatch) {
            return {
                type: typeMatch[1].toLowerCase() as GenerateRequest["type"],
                cleanTopic: typeMatch[2].trim(),
                includeImage,
            };
        }

        return { type: "phrase", cleanTopic: topic, includeImage };
    }

    getClient(): Client {
        return this.client;
    }

    async start(token: string): Promise<void> {
        await this.client.login(token);
    }

    async stop(): Promise<void> {
        await this.client.destroy();
    }
}
