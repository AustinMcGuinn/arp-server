# Core Resource

The `[core]` resource is the foundation of the framework, providing player management, permissions, and exports for other resources to use.

## Overview

The core resource handles:

- Player connection and disconnection
- Player identification (license, Discord, Steam)
- Character session management
- Permission levels
- Money operations
- Exports for inter-resource communication

## Exports

Exports are functions exposed for other resources to call. Access them via the `exports` global:

```typescript
// Lua
local player = exports['[core]']:getPlayer(source)

// TypeScript/JavaScript
const player = exports["[core]"].getPlayer(source);
```

### Player Exports

#### getPlayer

Get a connected player by server ID.

```typescript
exports["[core]"].getPlayer(source: number): FrameworkPlayer | undefined
```

**Returns:** `FrameworkPlayer` object or `undefined` if not found.

```typescript
interface FrameworkPlayer {
  source: number;
  identifiers: {
    license: string;
    discord?: string;
    steam?: string;
    ip?: string;
  };
  name: string;
  character: PlayerCharacter | null;
}
```

**Example:**

```typescript
const player = exports["[core]"].getPlayer(source);
if (player) {
  console.log(`Player: ${player.name}`);
  if (player.character) {
    console.log(`Character: ${player.character.fullName}`);
  }
}
```

#### getPlayers

Get all connected players.

```typescript
exports["[core]"].getPlayers(): FrameworkPlayer[]
```

**Example:**

```typescript
const players = exports["[core]"].getPlayers();
console.log(`Online players: ${players.length}`);
```

#### getPlayerByLicense

Find a player by their license identifier.

```typescript
exports["[core]"].getPlayerByLicense(license: string): FrameworkPlayer | undefined
```

**Example:**

```typescript
const player = exports["[core]"].getPlayerByLicense("license:abc123...");
```

### Character Exports

#### getCharacter

Get the active character for a player.

```typescript
exports["[core]"].getCharacter(source: number): PlayerCharacter | null
```

**Returns:** `PlayerCharacter` or `null` if no character selected.

```typescript
interface PlayerCharacter {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: Date;
  gender: "male" | "female";
  cash: number;
  bank: number;
  job: PlayerJob;
  position: Vector3;
  isDead: boolean;
}
```

**Example:**

```typescript
const character = exports["[core]"].getCharacter(source);
if (character) {
  console.log(`Playing as: ${character.fullName}`);
  console.log(`Job: ${character.job.label}`);
}
```

#### setCharacter

Set the active character for a player (used by character-selection).

```typescript
exports["[core]"].setCharacter(source: number, character: PlayerCharacter): void
```

### Money Exports

#### addMoney

Add money to a character.

```typescript
exports["[core]"].addMoney(source: number, type: "cash" | "bank", amount: number): boolean
```

**Returns:** `true` if successful, `false` if player not found.

**Example:**

```typescript
// Give player $500 cash
const success = exports["[core]"].addMoney(source, "cash", 500);
if (success) {
  emitNet("framework:showNotification", source, "success", "Money", "You received $500");
}
```

#### removeMoney

Remove money from a character.

```typescript
exports["[core]"].removeMoney(source: number, type: "cash" | "bank", amount: number): boolean
```

**Returns:** `true` if successful, `false` if insufficient funds or player not found.

**Example:**

```typescript
// Charge player $100 from bank
if (exports["[core]"].removeMoney(source, "bank", 100)) {
  // Purchase successful
} else {
  emitNet("framework:showNotification", source, "error", "Error", "Insufficient funds");
}
```

#### getMoney

Get a character's money balance.

```typescript
exports["[core]"].getMoney(source: number, type: "cash" | "bank"): number
```

**Example:**

```typescript
const cash = exports["[core]"].getMoney(source, "cash");
const bank = exports["[core]"].getMoney(source, "bank");
console.log(`Cash: $${cash}, Bank: $${bank}`);
```

### Permission Exports

#### hasPermission

Check if a player has a specific custom permission.

```typescript
exports["[core]"].hasPermission(source: number, permission: string): boolean
```

**Example:**

```typescript
if (exports["[core]"].hasPermission(source, "police.cuff")) {
  // Allow handcuffing
}
```

#### hasLevel

Check if a player has at least a certain permission level.

```typescript
exports["[core]"].hasLevel(source: number, level: string): boolean
```

**Levels:** `user` < `moderator` < `admin` < `superadmin` < `owner`

**Example:**

```typescript
if (exports["[core]"].hasLevel(source, "admin")) {
  // Allow admin action
}
```

#### isAdmin

Check if a player is admin or higher.

```typescript
exports["[core]"].isAdmin(source: number): boolean
```

**Example:**

```typescript
if (exports["[core]"].isAdmin(source)) {
  // Show admin menu
}
```

#### setPermissionLevel

Set a player's permission level.

```typescript
exports["[core]"].setPermissionLevel(source: number, level: string): void
```

#### addPermission

Add a custom permission to a player.

```typescript
exports["[core]"].addPermission(source: number, permission: string): void
```

#### removePermission

Remove a custom permission from a player.

```typescript
exports["[core]"].removePermission(source: number, permission: string): void
```

## Permission System

### Permission Levels

Hierarchical permission levels (configured in `config.lua`):

| Level | Value | Description |
|-------|-------|-------------|
| `user` | 0 | Default for all players |
| `moderator` | 1 | Can moderate chat, kick players |
| `admin` | 2 | Full admin access |
| `superadmin` | 3 | Server management |
| `owner` | 4 | All permissions |

### Custom Permissions

In addition to levels, players can have custom permissions:

```typescript
// Grant permission
exports["[core]"].addPermission(source, "vehicles.spawn");

// Check permission
if (exports["[core]"].hasPermission(source, "vehicles.spawn")) {
  // Allow spawning vehicles
}
```

Owners automatically have all permissions.

## Server Events

The core resource emits events that other resources can listen to:

### playerLoaded

Fired when a player finishes connecting.

```typescript
on("framework:playerLoaded", (source: number, player: FrameworkPlayer) => {
  console.log(`${player.name} connected`);
});
```

### playerDropped

Fired when a player disconnects.

```typescript
on("framework:playerDropped", (source: number, player: FrameworkPlayer, reason: string) => {
  console.log(`${player.name} left: ${reason}`);
});
```

### characterSelected

Fired when a player selects a character.

```typescript
on("framework:characterSelected", (source: number, character: PlayerCharacter) => {
  console.log(`${source} now playing as ${character.fullName}`);
});
```

## Client Events

Events sent to clients:

### framework:openCharacterSelect

Triggers the character selection UI.

```typescript
emitNet("framework:openCharacterSelect", source);
```

### framework:updateMoney

Updates the client's money display.

```typescript
emitNet("framework:updateMoney", source, "cash" | "bank", amount);
```

## Configuration

Edit `resources/[core]/config.lua`:

```lua
Config = {}

-- Permission level values
Config.PermissionLevels = {
    user = 0,
    moderator = 1,
    admin = 2,
    superadmin = 3,
    owner = 4,
}

-- Default spawn location (for new characters)
Config.DefaultSpawn = {
    x = -269.4,
    y = -955.3,
    z = 31.2,
    heading = 205.0,
}

-- Maximum characters per player
Config.MaxCharacters = 5
```

## Usage Examples

### Check if player can access police features

```typescript
onNet("police:openMenu", () => {
  const source = (globalThis as any).source as number;
  const character = exports["[core]"].getCharacter(source);
  
  if (!character) return;
  
  if (character.job.name !== "police") {
    emitNet("framework:showNotification", source, "error", "Error", "You are not a police officer");
    return;
  }
  
  emitNet("police:showMenu", source);
});
```

### Paying another player

```typescript
onNet("payment:send", (targetSource: number, amount: number) => {
  const source = (globalThis as any).source as number;
  
  if (amount <= 0) return;
  
  // Remove from sender
  if (!exports["[core]"].removeMoney(source, "cash", amount)) {
    emitNet("framework:showNotification", source, "error", "Error", "Insufficient cash");
    return;
  }
  
  // Add to receiver
  exports["[core]"].addMoney(targetSource, "cash", amount);
  
  const senderChar = exports["[core]"].getCharacter(source);
  const receiverChar = exports["[core]"].getCharacter(targetSource);
  
  emitNet("framework:showNotification", source, "success", "Payment", `You sent $${amount} to ${receiverChar?.fullName}`);
  emitNet("framework:showNotification", targetSource, "success", "Payment", `You received $${amount} from ${senderChar?.fullName}`);
});
```
