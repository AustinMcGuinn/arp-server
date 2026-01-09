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

## FiveM Server Setup Guide

This guide walks you through setting up this framework with a FiveM server from scratch.

### Step 1: Set Up Your FiveM Server

If you don't already have a FiveM server:

1. **Download the FiveM server artifacts:**

   - Go to [FiveM Runtime](https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/) (Windows) or use Linux builds
   - Download the latest recommended build
   - Extract to a folder (e.g., `C:\FXServer\server`)

2. **Install txAdmin (recommended):**

   - txAdmin comes bundled with FiveM server artifacts
   - Run `FXServer.exe` and follow the txAdmin setup wizard
   - Create a new server with the "CFX Default" template or blank template

3. **Get your license key:**
   - Go to [Cfx.re Keymaster](https://keymaster.fivem.net/)
   - Register/login and generate a server key
   - Save this key for your `server.cfg`

### Step 2: Set Up PlanetScale Database

1. **Create a PlanetScale account:**

   - Go to [PlanetScale](https://planetscale.com/) and sign up
   - Create a new database (free tier works fine)

2. **Get your connection string:**
   - Go to your database → "Connect" → "Connect with Node.js"
   - Copy the connection string (looks like: `mysql://username:password@host/database?ssl={"rejectUnauthorized":true}`)

### Step 3: Clone and Configure the Framework

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AustinMcGuinn/arp-server.git
   cd arp-server
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your PlanetScale connection string:

   ```env
   DATABASE_URL="mysql://username:password@host/database?ssl={\"rejectUnauthorized\":true}"
   ```

4. **Push the database schema:**

   ```bash
   pnpm db:push
   ```

5. **Build all resources:**
   ```bash
   pnpm build
   ```

### Step 4: Link Resources to Your FiveM Server

**Option A: Symlink (recommended for development)**

```bash
# Windows (run as Administrator)
mklink /D "C:\FXServer\server-data\resources\[framework]" "C:\path\to\arp-server\resources"

# Linux/macOS
ln -s /path/to/arp-server/resources /path/to/fxserver/server-data/resources/[framework]
```

**Option B: Copy resources**

Copy the entire `resources` folder contents to your FiveM server's `resources` directory.

### Step 5: Configure server.cfg

Add the following to your FiveM server's `server.cfg`:

```cfg
# OneSync (required)
onesync on
onesync_distanceCullVehicles false
onesync_enableBeyond true

# Framework Configuration
set database_url "mysql://username:password@host/database?ssl={\"rejectUnauthorized\":true}"
set ws_port "3001"
set ws_jwt_secret "your-super-secret-jwt-key-change-this-to-something-random"

# Start Framework Resources (order matters!)
ensure [core]
ensure [database]
ensure [websocket]
ensure character-selection
ensure character-creation
ensure inventory
ensure jobs
ensure vehicles
```

> ⚠️ **Important:** Replace the placeholder values with your actual credentials. Generate a strong random string for `ws_jwt_secret`.

### Step 6: Start Your Server

1. Start your FiveM server via txAdmin or directly with `FXServer.exe`
2. Check the console for any errors
3. Connect to your server using FiveM (connect to `localhost:30120` for local testing)

### Troubleshooting

| Issue                          | Solution                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `Database connection failed`   | Verify your `database_url` convar is correct and PlanetScale IP restrictions allow your server |
| `Resource not found`           | Ensure resources are in the correct path and brackets `[]` are preserved in folder names       |
| `NUI not loading`              | Run `pnpm build` to compile NUI resources                                                      |
| `WebSocket connection refused` | Check that the `ws_port` matches your admin panel configuration                                |

---

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
