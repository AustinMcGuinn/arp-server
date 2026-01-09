# Configuration

This document covers all configuration options available in the framework.

## Environment Variables

### `.env` File

The root `.env` file contains sensitive configuration:

```env
# Database connection string (PlanetScale)
DATABASE_URL="mysql://username:password@host/database?ssl={\"rejectUnauthorized\":true}"
```

## Server Convars

Convars are set in your `server.cfg` and read by resources at runtime.

### Database Resource

| Convar | Description | Default | Required |
|--------|-------------|---------|----------|
| `database_url` | MySQL connection string | - | Yes |

```cfg
set database_url "mysql://user:pass@host/db?ssl={\"rejectUnauthorized\":true}"
```

### WebSocket Resource

| Convar | Description | Default | Required |
|--------|-------------|---------|----------|
| `ws_port` | WebSocket server port | `3001` | No |
| `ws_jwt_secret` | JWT signing secret | - | Yes |

```cfg
set ws_port "3001"
set ws_jwt_secret "your-secret-key-min-32-chars"
```

## Resource Configuration Files

### Core Resource (`resources/[core]/config.lua`)

```lua
Config = {}

-- Permission levels (higher = more access)
Config.PermissionLevels = {
    user = 0,
    moderator = 1,
    admin = 2,
    superadmin = 3,
    owner = 4,
}

-- Spawn location for new characters
Config.DefaultSpawn = {
    x = -269.4,
    y = -955.3,
    z = 31.2,
    heading = 205.0,
}

-- Maximum characters per player
Config.MaxCharacters = 5
```

### Inventory Resource (`resources/inventory/config.lua`)

```lua
Config = {}

-- Player inventory settings
Config.PlayerSlots = 50
Config.PlayerMaxWeight = 100000  -- in grams (100kg)

-- Item definitions
Config.Items = {
    ["water"] = {
        label = "Water Bottle",
        description = "A refreshing bottle of water",
        weight = 500,
        stackable = true,
        maxStack = 10,
        usable = true,
        image = "water.png",
        category = "drink",
    },
    -- Add more items...
}

-- Drop settings
Config.DropDespawnTime = 300  -- seconds
```

### Jobs Resource (`resources/jobs/config.lua`)

```lua
Config = {}

-- Job definitions
Config.Jobs = {
    ["police"] = {
        label = "Los Santos Police Department",
        defaultDuty = false,
        grades = {
            { grade = 0, name = "cadet", label = "Cadet", salary = 500, isBoss = false },
            { grade = 1, name = "officer", label = "Officer", salary = 750, isBoss = false },
            { grade = 2, name = "sergeant", label = "Sergeant", salary = 1000, isBoss = false },
            { grade = 3, name = "lieutenant", label = "Lieutenant", salary = 1250, isBoss = false },
            { grade = 4, name = "chief", label = "Chief", salary = 1500, isBoss = true },
        },
    },
    ["ambulance"] = {
        label = "Los Santos Medical Services",
        defaultDuty = false,
        grades = {
            { grade = 0, name = "emt", label = "EMT", salary = 500, isBoss = false },
            { grade = 1, name = "paramedic", label = "Paramedic", salary = 750, isBoss = false },
            { grade = 2, name = "doctor", label = "Doctor", salary = 1000, isBoss = false },
            { grade = 3, name = "chief", label = "Chief of Medicine", salary = 1250, isBoss = true },
        },
    },
    ["unemployed"] = {
        label = "Unemployed",
        defaultDuty = true,
        isDefault = true,
        grades = {
            { grade = 0, name = "unemployed", label = "Unemployed", salary = 0, isBoss = false },
        },
    },
}
```

### Vehicles Resource (`resources/vehicles/config.lua`)

```lua
Config = {}

-- Garage locations
Config.Garages = {
    ["legion"] = {
        label = "Legion Square Parking",
        position = { x = 215.8, y = -810.0, z = 30.7 },
        spawnPoints = {
            { x = 228.5, y = -800.5, z = 30.5, heading = 160.0 },
            { x = 232.5, y = -797.5, z = 30.5, heading = 160.0 },
        },
        vehicleTypes = { "car", "motorcycle" },
    },
    ["airport"] = {
        label = "Airport Hangar",
        position = { x = -1025.0, y = -3015.0, z = 13.9 },
        spawnPoints = {
            { x = -1030.0, y = -3010.0, z = 13.9, heading = 60.0 },
        },
        vehicleTypes = { "aircraft" },
    },
}

-- Impound settings
Config.ImpoundLocation = {
    position = { x = 400.0, y = -1630.0, z = 29.3 },
    fee = 500,
}
```

## Admin Panel Configuration

The admin panel (`apps/admin-panel`) uses environment variables:

```env
# API Configuration
VITE_WS_URL=ws://localhost:3001
VITE_API_URL=http://localhost:3000
```

## OneSync Configuration

Required OneSync settings in `server.cfg`:

```cfg
# Enable OneSync
onesync on

# Vehicle culling (recommended off for vehicle persistence)
onesync_distanceCullVehicles false

# Enable beyond visual range sync
onesync_enableBeyond true
```

## Database Schema Customization

The database schema is defined in `resources/[database]/src/server/schema.ts`. To add new tables:

1. Edit the schema file
2. Run `pnpm db:push` to apply changes
3. Run `pnpm db:generate` to create migration files (optional)

See [Database Documentation](./resources/database.md) for schema details.

## Resource Load Order

Resources must be ensured in the correct order:

```cfg
# Core resources first (order matters within brackets)
ensure [core]
ensure [database]
ensure [websocket]

# Game resources (any order)
ensure character-selection
ensure character-creation
ensure inventory
ensure jobs
ensure vehicles
```

The bracket notation `[core]` tells FiveM to load all resources in that folder.
