import { MessageGeneratorService } from "@domain/services/message-generator";
import { DiscordHandler } from "@adapters/driving/discord-handler";
import { CronScheduler } from "@adapters/driving/cron-scheduler";
import { OpenRouterAdapter } from "@adapters/driven/ai/openrouter.adapter";
import { PollinationsAdapter } from "@adapters/driven/image/pollinations.adapter";
import { DiscordSenderAdapter } from "@adapters/driven/discord-sender.adapter";
import { FallbackAIAdapter } from "@adapters/driven/ai/fallback.adapter";
import type { Config } from "./env";
import { Client, GatewayIntentBits } from "discord.js";

/**
 * Dependency Injection Container
 * Wire all adapters and services together
 */
export function createContainer(config: Config) {
    // Create driven adapters (output)
    const aiAdapter = config.ai.openRouterApiKey
        ? new OpenRouterAdapter(config.ai.openRouterApiKey)
        : new FallbackAIAdapter();

    const imageAdapter = new PollinationsAdapter();

    // Create ONE single Discord Client to be shared
    const sharedClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    // Create sender adapter using the shared client
    const senderAdapter = new DiscordSenderAdapter(sharedClient);

    // Create domain service
    const messageGenerator = new MessageGeneratorService(
        aiAdapter,
        imageAdapter,
        senderAdapter
    );

    // Create Discord handler with the SHARED client
    const discordHandler = new DiscordHandler(messageGenerator, sharedClient);

    // We don't need double instantiation anymore if we pass the client manually
    const finalHandler = discordHandler;
    const finalGenerator = messageGenerator;

    // Create scheduler if enabled
    let scheduler: CronScheduler | null = null;
    if (config.scheduler.enabled) {
        scheduler = new CronScheduler(finalGenerator, {
            schedule: config.scheduler.schedule,
            channelId: config.discord.channelId,
            topics: config.scheduler.topics,
        });
    }

    return {
        discordHandler: finalHandler,
        messageGenerator: finalGenerator,
        scheduler,
    };
}
