# Creating Resources

This guide walks you through creating new FiveM resources for the framework.

## Resource Structure

A typical framework resource has this structure:

```
my-resource/
├── fxmanifest.lua      # Resource manifest
├── package.json        # Node.js dependencies
├── tsconfig.json       # TypeScript configuration
├── config.lua          # Resource configuration (optional)
└── src/
    ├── client/
    │   └── index.ts    # Client-side code
    ├── server/
    │   └── index.ts    # Server-side code
    └── shared/
        └── index.ts    # Shared code (optional)
```

## Step 1: Create Resource Folder

```bash
mkdir resources/my-resource
cd resources/my-resource
```

## Step 2: Create fxmanifest.lua

```lua
fx_version 'cerulean'
game 'gta5'

name 'my-resource'
description 'My custom resource'
author 'Your Name'
version '1.0.0'

-- Shared scripts (load first)
shared_scripts {
    'config.lua',
}

-- Client scripts
client_scripts {
    'dist/client/*.js',
}

-- Server scripts
server_scripts {
    'dist/server/*.js',
}

-- Dependencies
dependencies {
    '[core]',
    '[database]',
}
```

## Step 3: Create package.json

```json
{
  "name": "my-resource",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "node ../../scripts/build.mjs",
    "build:watch": "node ../../scripts/build.mjs --watch"
  },
  "dependencies": {
    "@framework/types": "workspace:*",
    "@framework/utils": "workspace:*"
  },
  "devDependencies": {
    "@citizenfx/client": "latest",
    "@citizenfx/server": "latest",
    "typescript": "^5.0.0"
  }
}
```

## Step 4: Create tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## Step 5: Create Client Script

```typescript
// src/client/index.ts
const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting client...`);

// Register commands
RegisterCommand("mycommand", () => {
  console.log("Command executed!");
  emitNet("my-resource:serverEvent", { data: "hello" });
}, false);

// Listen for server events
onNet("my-resource:clientEvent", (data: any) => {
  console.log("Received from server:", data);
});

// Key mapping
RegisterKeyMapping("mycommand", "My Command", "keyboard", "F5");

console.log(`[${RESOURCE_NAME}] Client loaded!`);
```

## Step 6: Create Server Script

```typescript
// src/server/index.ts
const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting server...`);

// Get exports from core
function getPlayer(source: number) {
  return exports["[core]"].getPlayer(source);
}

function getCharacter(source: number) {
  return exports["[core]"].getCharacter(source);
}

// Listen for client events
onNet("my-resource:serverEvent", (data: any) => {
  const source = (globalThis as any).source as number;
  const player = getPlayer(source);
  
  if (!player) return;
  
  console.log(`${player.name} sent:`, data);
  
  // Send response
  emitNet("my-resource:clientEvent", source, { response: "received!" });
});

// Register server command
RegisterCommand("servercommand", (source: number, args: string[]) => {
  if (source === 0) {
    // Console command
    console.log("Console executed command with args:", args);
  } else {
    // Player command
    const player = getPlayer(source);
    console.log(`${player?.name} executed command`);
  }
}, true); // restricted

console.log(`[${RESOURCE_NAME}] Server loaded!`);
```

## Step 7: Install Dependencies

```bash
pnpm install
```

## Step 8: Build Resource

```bash
pnpm build
```

Or watch for changes:

```bash
pnpm build:watch
```

## Step 9: Add to server.cfg

```cfg
ensure my-resource
```

## Using Framework Exports

### Core Exports

```typescript
// Get player data
const player = exports["[core]"].getPlayer(source);

// Get active character
const character = exports["[core]"].getCharacter(source);

// Money operations
exports["[core]"].addMoney(source, "cash", 1000);
exports["[core]"].removeMoney(source, "bank", 500);
const balance = exports["[core]"].getMoney(source, "cash");

// Permissions
if (exports["[core]"].hasPermission(source, "admin")) {
  // Admin action
}
```

### Database Exports

```typescript
// Query database
const characters = await exports["[database]"].getCharactersByLicense(license);
const vehicle = await exports["[database]"].getVehicleByPlate(plate);

// Update data
await exports["[database]"].updateCharacter(characterId, { cash: 5000 });
```

### Inventory Exports

```typescript
// Add/remove items
await exports["inventory"].addItem(source, "water", 5);
await exports["inventory"].removeItem(source, "bandage", 1);

// Check items
if (await exports["inventory"].hasItem(source, "lockpick")) {
  // Has lockpick
}
```

### Jobs Exports

```typescript
// Check job
if (exports["jobs"].hasJob(source, "police")) {
  // Is police
}

// Check duty
if (exports["jobs"].isOnDuty(source)) {
  // On duty
}

// Set job
exports["jobs"].setJob(source, "mechanic", 0);
```

## Configuration Files

### Lua Config

```lua
-- config.lua
Config = {}

Config.Enabled = true
Config.Cooldown = 5000
Config.Locations = {
    { x = 100.0, y = 200.0, z = 30.0 },
    { x = 150.0, y = 250.0, z = 35.0 },
}
```

Access in TypeScript:

```typescript
const config = (globalThis as any).Config;
console.log(config.Cooldown); // 5000
```

### TypeScript Config

For type safety, define types:

```typescript
// src/shared/index.ts
export interface ResourceConfig {
  enabled: boolean;
  cooldown: number;
  locations: { x: number; y: number; z: number }[];
}

export function getConfig(): ResourceConfig {
  return (globalThis as any).Config;
}
```

## Adding NUI

See [NUI Development Guide](./nui-development.md) for adding browser interfaces.

## Events Best Practices

### Naming Convention

Use resource-prefixed event names:

```typescript
// Good
emitNet("my-resource:doAction", source, data);

// Bad
emitNet("doAction", source, data);
```

### Event Validation

Always validate incoming data:

```typescript
import { z } from "zod";

const ActionSchema = z.object({
  targetId: z.number().int().positive(),
  action: z.enum(["give", "take"]),
  amount: z.number().positive(),
});

onNet("my-resource:action", (data: unknown) => {
  const source = (globalThis as any).source as number;
  
  const result = ActionSchema.safeParse(data);
  if (!result.success) {
    emitNet("framework:showNotification", source, "error", "Error", "Invalid data");
    return;
  }
  
  // Use result.data safely
  processAction(source, result.data);
});
```

### Security

Never trust client data:

```typescript
// BAD - trusts client-provided money amount
onNet("shop:purchase", (amount: number) => {
  exports["[core]"].addMoney(source, "cash", amount);
});

// GOOD - uses server-side price lookup
onNet("shop:purchase", (itemId: string) => {
  const source = (globalThis as any).source as number;
  const item = getShopItem(itemId);
  
  if (!item) return;
  
  if (!exports["[core]"].removeMoney(source, "cash", item.price)) {
    return; // Can't afford
  }
  
  // Give item at server-defined price
  exports["inventory"].addItem(source, itemId, 1);
});
```

## Exporting Functions

Make functions available to other resources:

```typescript
// Export a function
exports("myFunction", (param1: string, param2: number) => {
  return doSomething(param1, param2);
});

// Use in another resource
const result = exports["my-resource"].myFunction("test", 123);
```

## Complete Example

Here's a complete simple resource:

```typescript
// src/server/index.ts
import { z } from "zod";

const RESOURCE_NAME = GetCurrentResourceName();

const GiveMoneySchema = z.object({
  targetSource: z.number().int(),
  amount: z.number().positive().max(10000),
});

onNet("money-transfer:give", async (data: unknown) => {
  const source = (globalThis as any).source as number;
  
  const result = GiveMoneySchema.safeParse(data);
  if (!result.success) {
    emitNet("framework:showNotification", source, "error", "Error", "Invalid amount");
    return;
  }
  
  const { targetSource, amount } = result.data;
  
  // Verify both players exist
  const sender = exports["[core]"].getCharacter(source);
  const receiver = exports["[core]"].getCharacter(targetSource);
  
  if (!sender || !receiver) {
    emitNet("framework:showNotification", source, "error", "Error", "Player not found");
    return;
  }
  
  // Transfer money
  if (!exports["[core]"].removeMoney(source, "cash", amount)) {
    emitNet("framework:showNotification", source, "error", "Error", "Insufficient funds");
    return;
  }
  
  exports["[core]"].addMoney(targetSource, "cash", amount);
  
  // Notify both players
  emitNet("framework:showNotification", source, "success", "Transfer", 
    `You gave $${amount} to ${receiver.fullName}`);
  emitNet("framework:showNotification", targetSource, "success", "Transfer", 
    `You received $${amount} from ${sender.fullName}`);
});

console.log(`[${RESOURCE_NAME}] Loaded!`);
```
