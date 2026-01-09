# FiveM TypeScript Framework

A modular FiveM server framework built with TypeScript, featuring Drizzle ORM, SolidJS NUI, and WebSocket integration.

## Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- FiveM Server (txAdmin recommended)
- PlanetScale Database

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your PlanetScale credentials
   ```

3. **Push database schema:**

   ```bash
   pnpm db:push
   ```

4. **Build all resources:**

   ```bash
   pnpm build
   ```

5. **Link to FiveM server:**
   Copy or symlink the `resources` folder to your FiveM server's resources directory.

## Project Structure

```
├── packages/           # Shared internal packages
│   ├── types/          # @framework/types - Shared TypeScript types
│   ├── utils/          # @framework/utils - Shared utilities
│   └── ui/             # @framework/ui - SolidJS component library
│
├── resources/          # FiveM resources
│   ├── [core]/         # Core framework resource
│   ├── [database]/     # Database connection & schema
│   ├── [websocket]/    # WebSocket server
│   ├── character-creation/
│   ├── character-selection/
│   ├── inventory/
│   ├── jobs/
│   └── vehicles/
│
└── apps/
    └── admin-panel/    # External admin dashboard
```

## Development

```bash
# Watch mode for all resources
pnpm build:watch

# Open Drizzle Studio
pnpm db:studio
```

## Adding to server.cfg

```cfg
ensure [core]
ensure [database]
ensure [websocket]
ensure character-selection
ensure character-creation
ensure inventory
ensure jobs
ensure vehicles
```

## License

MIT
