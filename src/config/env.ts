/**
 * Environment configuration
 */
export interface Config {
    discord: {
        token: string;
        channelId: string;
    };
    ai: {
        provider: "openrouter";
        openRouterApiKey: string;
    };
    scheduler: {
        enabled: boolean;
        schedule: string;
        topics: string[];
    };
}

export function loadConfig(): Config {
    const token = process.env.DISCORD_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    // Optional now
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";

    if (!token) {
        throw new Error("DISCORD_TOKEN is required");
    }

    if (!channelId) {
        throw new Error("DISCORD_CHANNEL_ID is required");
    }

    // Key check removed here - handled in container logic

    return {
        discord: {
            token,
            channelId,
        },
        ai: {
            provider: "openrouter",
            openRouterApiKey,
        },
        scheduler: {
            enabled: process.env.SCHEDULER_ENABLED === "true",
            schedule: process.env.POST_SCHEDULE || "0 9 * * *",
            topics: (process.env.SCHEDULED_TOPICS || "nature,love,wisdom,technology").split(","),
        },
    };
}
