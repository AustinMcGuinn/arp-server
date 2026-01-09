# Getting Started

This guide walks you through setting up the FiveM TypeScript Framework from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (`npm install -g pnpm`)
- **FiveM Server** with txAdmin (recommended)
- **PlanetScale** database account (free tier available)

## Step 1: Set Up Your FiveM Server

If you don't already have a FiveM server:

### Download Server Artifacts

1. Go to [FiveM Runtime](https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/) (Windows) or [Linux builds](https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/)
2. Download the latest recommended build
3. Extract to a folder (e.g., `C:\FXServer\server`)

### Install txAdmin

txAdmin comes bundled with FiveM server artifacts:

1. Run `FXServer.exe` (Windows) or `run.sh` (Linux)
2. Follow the txAdmin setup wizard
3. Create a new server with a blank template

### Get Your License Key

1. Go to [Cfx.re Keymaster](https://keymaster.fivem.net/)
2. Register or login
3. Generate a server key
4. Save this key for your `server.cfg`

## Step 2: Set Up PlanetScale Database

### Create Account and Database

1. Go to [PlanetScale](https://planetscale.com/) and sign up
2. Create a new database (free tier works fine)
3. Choose a region close to your server

### Get Connection String

1. Go to your database dashboard
2. Click "Connect" → "Connect with Node.js"
3. Copy the connection string:

```
mysql://username:password@host/database?ssl={"rejectUnauthorized":true}
```

## Step 3: Clone and Configure

### Clone the Repository

```bash
git clone https://github.com/AustinMcGuinn/arp-server.git
cd arp-server
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your PlanetScale connection string:

```env
DATABASE_URL="mysql://username:password@host/database?ssl={\"rejectUnauthorized\":true}"
```

### Push Database Schema

```bash
pnpm db:push
```

This creates all the necessary tables in your PlanetScale database.

### Build All Resources

```bash
pnpm build
```

## Step 4: Link Resources to FiveM

### Option A: Symlink (Recommended for Development)

Symlinks allow you to edit files and see changes without copying:

**Windows (run as Administrator):**

```cmd
mklink /D "C:\FXServer\server-data\resources\[framework]" "C:\path\to\arp-server\resources"
```

**Linux/macOS:**

```bash
ln -s /path/to/arp-server/resources /path/to/fxserver/server-data/resources/[framework]
```

### Option B: Copy Resources

Copy the entire `resources` folder contents to your FiveM server's `resources` directory.

## Step 5: Configure server.cfg

Add the following to your FiveM server's `server.cfg`:

```cfg
# OneSync (required)
onesync on
onesync_distanceCullVehicles false
onesync_enableBeyond true

# Framework Configuration
set database_url "mysql://username:password@host/database?ssl={\"rejectUnauthorized\":true}"
set ws_port "3001"
set ws_jwt_secret "generate-a-random-32-character-secret-here"

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

> **Important:** Replace placeholder values with your actual credentials. Use a strong random string for `ws_jwt_secret`.

## Step 6: Start Your Server

1. Start your FiveM server via txAdmin or directly
2. Check the console for any errors
3. Connect using FiveM (`localhost:30120` for local testing)

## Verifying Installation

After starting the server, you should see in the console:

```
[core] Starting Core Framework...
[core] Exports registered
[core] Core Framework loaded successfully!
[database] Connected to database
[websocket] Server started on port 3001
```

## Development Workflow

For ongoing development:

```bash
# Watch mode - automatically rebuilds on changes
pnpm build:watch

# Open Drizzle Studio to view/edit database
pnpm db:studio
```

## Next Steps

- [Configuration](./configuration.md) - Customize framework settings
- [Architecture](./architecture.md) - Understand the system design
- [Creating Resources](./development/creating-resources.md) - Add new features

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Database connection failed` | Verify `database_url` convar and PlanetScale IP restrictions |
| `Resource not found` | Ensure resources are in correct path; preserve `[]` brackets in folder names |
| `NUI not loading` | Run `pnpm build` to compile NUI resources |
| `WebSocket connection refused` | Check `ws_port` matches admin panel configuration |
| `ensure order errors` | Core resources must start before game resources |
