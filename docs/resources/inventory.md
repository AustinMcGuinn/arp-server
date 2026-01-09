# Inventory Resource

The `inventory` resource provides a complete inventory system with drag-and-drop UI, item stacking, weight limits, and multi-inventory support.

## Overview

Features:

- Slot-based inventory system
- Weight limits
- Item stacking
- Drag and drop between inventories
- Item usage and consumption
- Vehicle trunks and gloveboxes
- Stashes and drops
- Real-time sync

## Inventory Types

| Type | Description | Example ID |
|------|-------------|------------|
| `player` | Player's personal inventory | `player:123` (character ID) |
| `vehicle` | Generic vehicle inventory | `vehicle:ABC123` (plate) |
| `trunk` | Vehicle trunk | `trunk:ABC123` |
| `glovebox` | Vehicle glovebox | `glovebox:ABC123` |
| `stash` | Persistent storage | `stash:police_locker` |
| `drop` | Ground drop (temporary) | `drop:uuid` |
| `shop` | Shop inventory | `shop:ammunation` |

## Exports

### addItem

Add items to a player's inventory.

```typescript
exports["inventory"].addItem(
  source: number,
  name: string,
  count: number,
  metadata?: Record<string, unknown>
): Promise<boolean>
```

**Returns:** `true` if successful, `false` if inventory full or item not found.

**Example:**

```typescript
const success = await exports["inventory"].addItem(source, "water", 5);
if (success) {
  emitNet("framework:showNotification", source, "success", "Item", "You received 5x Water");
}
```

### removeItem

Remove items from a player's inventory.

```typescript
exports["inventory"].removeItem(
  source: number,
  name: string,
  count: number,
  slot?: number
): Promise<boolean>
```

**Returns:** `true` if successful, `false` if insufficient items.

**Example:**

```typescript
if (await exports["inventory"].removeItem(source, "water", 1)) {
  // Water was removed
}
```

### hasItem

Check if a player has an item.

```typescript
exports["inventory"].hasItem(
  source: number,
  name: string,
  count?: number  // Default: 1
): Promise<boolean>
```

**Example:**

```typescript
if (await exports["inventory"].hasItem(source, "lockpick")) {
  // Player has a lockpick
}

if (await exports["inventory"].hasItem(source, "ammo_pistol", 30)) {
  // Player has at least 30 pistol ammo
}
```

### getItem

Get an item definition.

```typescript
exports["inventory"].getItem(name: string): ItemDefinition | undefined
```

## Item Definitions

Items are defined in `resources/inventory/config.lua`:

```lua
Config.Items = {
    ["water"] = {
        label = "Water Bottle",
        description = "A refreshing bottle of water",
        weight = 500,          -- in grams
        stackable = true,
        maxStack = 10,
        usable = true,
        unique = false,
        image = "water.png",
        category = "drink",
    },
    ["phone"] = {
        label = "Phone",
        description = "A mobile phone",
        weight = 200,
        stackable = false,
        maxStack = 1,
        usable = true,
        unique = true,         -- Each has unique metadata
        image = "phone.png",
        category = "misc",
    },
    ["pistol"] = {
        label = "Pistol",
        description = "A semi-automatic handgun",
        weight = 1000,
        stackable = false,
        maxStack = 1,
        usable = true,
        unique = true,
        image = "pistol.png",
        category = "weapon",
    },
}
```

## Item Categories

- `weapon` - Firearms and melee weapons
- `ammo` - Ammunition
- `food` - Consumable food
- `drink` - Consumable drinks
- `medical` - First aid items
- `crafting` - Crafting materials
- `clothing` - Wearable items
- `misc` - Everything else

## Server Events

### inventory:open

Open the player's inventory.

```typescript
onNet("inventory:open", () => {
  // Opens primary inventory UI
});
```

### inventory:moveItem

Move items between slots/inventories.

```typescript
onNet("inventory:moveItem", (data: MoveItemInput) => {
  // Process item movement
});

interface MoveItemInput {
  fromInventory: string;  // e.g., "player:123"
  toInventory: string;
  fromSlot: number;
  toSlot: number;
  count: number;
}
```

### inventory:useItem

Use an item from a slot.

```typescript
onNet("inventory:useItem", (slot: number) => {
  // Trigger item use
});
```

### inventory:close

Close the inventory UI.

```typescript
onNet("inventory:close", () => {
  // Close NUI
});
```

## Item Use Events

When an item is used, the server emits:

```typescript
emit("inventory:itemUsed", source, item);
```

Other resources can listen for this:

```typescript
on("inventory:itemUsed", (source: number, item: InventoryItem) => {
  if (item.name === "water") {
    // Apply hydration effect
    emitNet("player:setHydration", source, 100);
  }
  
  if (item.name === "bandage") {
    // Heal player
    const ped = GetPlayerPed(String(source));
    SetEntityHealth(ped, GetEntityHealth(ped) + 25);
  }
});
```

## Inventory Structure

```typescript
interface Inventory {
  id: string;           // e.g., "player:123"
  type: InventoryType;
  label: string;        // Display name
  slots: number;        // Total slots
  maxWeight: number;    // Max weight in grams
  items: InventoryItem[];
}

interface InventoryItem {
  slot: number;
  name: string;
  label: string;
  count: number;
  weight: number;
  metadata: Record<string, unknown>;
  image: string;
}
```

## Item Metadata

Unique items can have metadata for customization:

```typescript
// Adding a weapon with serial number
await exports["inventory"].addItem(source, "pistol", 1, {
  serial: "WPN-12345",
  durability: 100,
  ammo: 12,
});

// Adding food with expiration
await exports["inventory"].addItem(source, "sandwich", 1, {
  expiration: Date.now() + 86400000,  // 24 hours
});
```

## Weight System

- Player max weight: 100,000g (100kg) by default
- Each item has a weight in grams
- Total weight = sum of (item.weight * item.count)
- Items cannot be added if total exceeds max

```lua
-- config.lua
Config.MaxWeight = 100000  -- 100kg
Config.MaxSlots = 40
```

## Vehicle Inventories

### Trunk Access

```typescript
// Client-side: Check if near vehicle trunk
onNet("inventory:openTrunk", (plate: string) => {
  emitNet("inventory:openVehicle", plate, "trunk");
});

// Server-side
onNet("inventory:openVehicle", async (plate: string, type: "trunk" | "glovebox") => {
  const source = (globalThis as any).source as number;
  
  const playerItems = await getInventory("player", String(characterId));
  const vehicleItems = await getInventory(type, plate);
  
  emitNet("inventory:openNui", source, {
    primary: playerInventory,
    secondary: vehicleInventory
  });
});
```

### Trunk Sizes

Configure trunk sizes per vehicle class:

```lua
Config.TrunkSizes = {
    compact = { slots = 20, maxWeight = 30000 },
    sedan = { slots = 30, maxWeight = 50000 },
    suv = { slots = 40, maxWeight = 75000 },
    van = { slots = 60, maxWeight = 150000 },
}
```

## Stashes

Persistent storage locations:

```typescript
// Create/access a stash
const items = await getInventory("stash", "police_evidence_123");

// Grant player access to stash UI
emitNet("inventory:openStash", source, {
  id: "police_evidence_123",
  label: "Evidence Locker #123",
  slots: 50,
  maxWeight: 200000
});
```

## Ground Drops

When players drop items:

```typescript
// Create a drop
const dropId = uuid();
await saveInventory("drop", dropId, [droppedItem]);

// Create visible prop at location
// ... spawn prop code ...

// Cleanup after timer
setTimeout(() => {
  deleteInventory("drop", dropId);
  // Remove prop
}, Config.DropDespawnTime * 1000);
```

## NUI Communication

### Opening Inventory

```typescript
// Single inventory
emitNet("inventory:openNui", source, {
  primary: inventoryData
});

// Dual inventory (e.g., player + trunk)
emitNet("inventory:openNui", source, {
  primary: playerInventory,
  secondary: trunkInventory
});
```

### Refresh After Changes

```typescript
emitNet("inventory:refresh", source);
```

## Configuration

```lua
-- resources/inventory/config.lua
Config = {}

Config.MaxSlots = 40
Config.MaxWeight = 100000  -- grams

Config.DropDespawnTime = 300  -- seconds

Config.Items = {
    -- Item definitions here
}
```

## UI Features

The inventory NUI provides:

- Drag and drop items
- Split stacks (shift+drag)
- Quick use (double-click)
- Context menu (right-click)
- Weight display
- Search/filter items
- Item tooltips with description
