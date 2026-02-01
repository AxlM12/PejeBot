import { loadConfig } from "@config/env";
import { createContainer } from "@config/container";

async function main() {
    console.log("🤖 Starting PejeBot...");

    // Load configuration
    const config = loadConfig();
    console.log("✅ Configuration loaded");

    // Create dependency container
    const { discordHandler, scheduler } = createContainer(config);
    console.log("✅ Dependencies injected");

    // Start Discord bot
    await discordHandler.start(config.discord.token);

    // Start scheduler if enabled
    if (scheduler) {
        scheduler.start();
    }

    // Graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n🛑 Shutting down...");
        scheduler?.stop();
        await discordHandler.stop();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("\n🛑 Shutting down...");
        scheduler?.stop();
        await discordHandler.stop();
        process.exit(0);
    });
}

main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});
