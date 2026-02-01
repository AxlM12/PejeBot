import cron from "node-cron";
import type { GenerateRequest } from "@domain/entities/generate-request";
import type { GenerateMessagePort } from "@ports/input/generate-message.port";

/**
 * Cron Scheduler - Driving adapter for scheduled posts
 */
export class CronScheduler {
    private task: cron.ScheduledTask | null = null;

    constructor(
        private readonly messageGenerator: GenerateMessagePort,
        private readonly config: {
            schedule: string;
            channelId: string;
            topics: string[];
        }
    ) { }

    start(): void {
        if (!cron.validate(this.config.schedule)) {
            throw new Error(`Invalid cron schedule: ${this.config.schedule}`);
        }

        this.task = cron.schedule(this.config.schedule, () => {
            this.runScheduledPost();
        });

        console.log(`📅 Scheduler started: ${this.config.schedule}`);
    }

    stop(): void {
        if (this.task) {
            this.task.stop();
            this.task = null;
            console.log("📅 Scheduler stopped");
        }
    }

    private async runScheduledPost(): Promise<void> {
        const topic = this.getRandomTopic();

        const request: GenerateRequest = {
            topic,
            type: "phrase",
            includeImage: true,
            channelId: this.config.channelId,
            language: "es",
        };

        try {
            console.log(`📝 Scheduled post: "${topic}"`);
            await this.messageGenerator.generate(request);
        } catch (error) {
            console.error("Scheduled post failed:", error);
        }
    }

    private getRandomTopic(): string {
        const index = Math.floor(Math.random() * this.config.topics.length);
        return this.config.topics[index];
    }
}
