# PejeBot

Discord bot that generates AI-powered phrases and images using **Hexagonal Architecture**.

## Architecture

```
src/
├── domain/          # Pure business logic (no external deps)
│   ├── entities/    # Request DTO & Result Entity
│   └── services/    # Message generator orchestration
├── ports/           # Interfaces (contracts)
│   ├── input/       # How triggers invoke the app
│   └── output/      # What the app needs from external services
├── adapters/        # Implementations
│   ├── driving/     # Discord handler, Cron scheduler
│   └── driven/      # AI providers, Image providers, Discord sender
└── config/          # Environment & Dependency Injection
```

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set environment variables (create `.env`):
   ```
   DISCORD_TOKEN=your_token
   DISCORD_CHANNEL_ID=channel_id
   OPENROUTER_API_KEY=your_key
   ```

3. Run the bot:
   ```bash
   bun run dev
   ```

## Usage

- **Mention the bot**: `@PejeBot sunset` → generates phrase + image about sunset
- **Scheduled posts**: Automatic posts at configured intervals
