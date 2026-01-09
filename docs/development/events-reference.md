# Events Reference

Complete reference of all events and callbacks in the framework.

## Event Types

The framework uses three types of events:

1. **Server Events** - Triggered on the server, listeners are server-side
2. **Client Events** - Triggered on clients, listeners are client-side  
3. **NUI Callbacks** - Communication between NUI (browser) and client scripts

## Server Events

Events emitted on the server that other server resources can listen to.

### Core Events

#### framework:playerLoaded

Fired when a player finishes connecting and is ready.

```typescript
on("framework:playerLoaded", (source: number, player: FrameworkPlayer) => {
  console.log(`${player.name} connected`);
  console.log(`License: ${player.identifiers.license}`);
});
```

#### framework:playerDropped

Fired when a player disconnects.

```typescript
on("framework:playerDropped", (source: number, player: FrameworkPlayer, reason: string) => {
  console.log(`${player.name} left: ${reason}`);
});
```

#### framework:characterSelected

Fired when a player selects a character.

```typescript
on("framework:characterSelected", (source: number, character: PlayerCharacter) => {
  console.log(`${character.fullName} spawned`);
  console.log(`Job: ${character.job.label}`);
});
```

#### framework:characterCreated

Fired when a new character is created.

```typescript
on("framework:characterCreated", (source: number, characterId: number) => {
  console.log(`New character created: ${characterId}`);
});
```

#### framework:characterDeleted

Fired when a character is deleted.

```typescript
on("framework:characterDeleted", (source: number, characterId: number) => {
  console.log(`Character deleted: ${characterId}`);
});
```

### Inventory Events

#### framework:inventoryUpdated

Fired when an inventory is modified.

```typescript
on("framework:inventoryUpdated", (inventoryId: string, items: InventoryItem[]) => {
  console.log(`Inventory ${inventoryId} updated`);
});
```

#### inventory:itemUsed

Fired when a player uses an item.

```typescript
on("inventory:itemUsed", (source: number, item: InventoryItem) => {
  if (item.name === "water") {
    // Apply hydration effect
  }
});
```

#### framework:itemAdded

Fired when an item is added to any inventory.

```typescript
on("framework:itemAdded", (inventoryId: string, item: InventoryItem) => {
  console.log(`Added ${item.count}x ${item.name}`);
});
```

#### framework:itemRemoved

Fired when an item is removed from any inventory.

```typescript
on("framework:itemRemoved", (inventoryId: string, itemName: string, count: number) => {
  console.log(`Removed ${count}x ${itemName}`);
});
```

### Job Events

#### framework:jobUpdated

Fired when a player's job changes.

```typescript
on("framework:jobUpdated", (source: number, oldJob: PlayerJobData, newJob: PlayerJobData) => {
  console.log(`Job changed: ${oldJob.name} -> ${newJob.name}`);
});
```

#### framework:dutyChanged

Fired when a player's duty status changes.

```typescript
on("framework:dutyChanged", (source: number, onDuty: boolean, jobName: string) => {
  console.log(`${jobName} duty: ${onDuty ? "on" : "off"}`);
});
```

### Vehicle Events

#### framework:vehicleSpawned

Fired when a player spawns a vehicle from garage.

```typescript
on("framework:vehicleSpawned", (source: number, vehicleId: number, plate: string) => {
  console.log(`Vehicle spawned: ${plate}`);
});
```

#### framework:vehicleStored

Fired when a vehicle is stored in garage.

```typescript
on("framework:vehicleStored", (source: number, vehicleId: number, garageId: string) => {
  console.log(`Vehicle stored in ${garageId}`);
});
```

## Client Events

Events sent from server to specific clients.

### Core Events

#### framework:openCharacterSelect

Opens the character selection UI.

```typescript
// Server
emitNet("framework:openCharacterSelect", source);

// Client
onNet("framework:openCharacterSelect", () => {
  openCharacterSelect();
});
```

#### framework:showNotification

Shows a notification to the player.

```typescript
emitNet("framework:showNotification", source, 
  "success",          // type: "success" | "error" | "info" | "warning"
  "Title",            // title
  "Message text"      // message
);
```

#### framework:updateMoney

Updates the player's money display.

```typescript
emitNet("framework:updateMoney", source, "cash", 5000);
emitNet("framework:updateMoney", source, "bank", 25000);
```

#### framework:spawnCharacter

Triggers character spawn with position and appearance.

```typescript
emitNet("framework:spawnCharacter", source, {
  position: { x: 100, y: 200, z: 30, heading: 180 },
  appearance: characterAppearance,
});
```

### Inventory Events

#### framework:openInventory

Opens the inventory UI.

```typescript
emitNet("framework:openInventory", source, {
  primary: playerInventory,
  secondary: otherInventory,  // optional
});
```

#### framework:refreshInventory

Refreshes the inventory display.

```typescript
emitNet("framework:refreshInventory", source);
```

### Vehicle Events

#### framework:vehicleKeys

Give vehicle keys to a player.

```typescript
emitNet("framework:vehicleKeys", source, {
  plate: "ABC123",
  granted: true,
});
```

## NUI Callbacks

Callbacks from NUI to client scripts.

### Character Selection

#### getCharacters

Request character list.

```typescript
// NUI
const result = await fetchNui("getCharacters");
// Returns: { characters: CharacterCardData[], maxCharacters: number }
```

#### selectCharacter

Select a character to play.

```typescript
// NUI
await fetchNui("selectCharacter", { id: characterId });
```

#### deleteCharacter

Delete a character.

```typescript
// NUI
await fetchNui("deleteCharacter", { id: characterId });
```

#### createNewCharacter

Start character creation.

```typescript
// NUI
await fetchNui("createNewCharacter");
```

### Character Creation

#### saveCharacter

Save a new character.

```typescript
// NUI
await fetchNui("saveCharacter", {
  firstName: "John",
  lastName: "Doe",
  dob: "1990-01-15",
  gender: "male",
  appearance: characterAppearance,
});
```

#### cancelCharacter

Cancel character creation.

```typescript
// NUI
await fetchNui("cancelCharacter");
```

#### updateAppearance

Update ped appearance in real-time.

```typescript
// NUI
await fetchNui("updateAppearance", {
  appearance: partialAppearance,
});
```

### Inventory

#### moveItem

Move items between slots/inventories.

```typescript
// NUI
await fetchNui("moveItem", {
  fromInventory: "player:123",
  toInventory: "trunk:ABC123",
  fromSlot: 1,
  toSlot: 5,
  count: 10,
});
```

#### useItem

Use an item.

```typescript
// NUI
await fetchNui("useItem", { slot: 1 });
```

#### dropItem

Drop an item on the ground.

```typescript
// NUI
await fetchNui("dropItem", { slot: 1, count: 5 });
```

#### closeInventory

Close the inventory UI.

```typescript
// NUI
await fetchNui("closeInventory");
```

### Generic

#### closeNui

Generic close callback (all NUIs should implement).

```typescript
// NUI
const { closeNui } = useNui();
closeNui();
```

## Event Constants

Import event names from `@framework/types`:

```typescript
import { ServerEvents, ClientEvents, NuiCallbacks } from "@framework/types";

// Server events
on(ServerEvents.PLAYER_LOADED, (source, player) => { });
on(ServerEvents.CHARACTER_SELECTED, (source, character) => { });
on(ServerEvents.INVENTORY_UPDATED, (inventoryId, items) => { });

// Client events (for emitNet)
emitNet(ClientEvents.SHOW_NOTIFICATION, source, "info", "Title", "Message");
emitNet(ClientEvents.OPEN_INVENTORY, source, inventoryData);

// NUI callbacks (string values)
NuiCallbacks.SELECT_CHARACTER  // "selectCharacter"
NuiCallbacks.MOVE_ITEM         // "moveItem"
```

## Event Constants List

### ServerEvents

| Constant | Value |
|----------|-------|
| `PLAYER_LOADED` | `"framework:playerLoaded"` |
| `PLAYER_DROPPED` | `"framework:playerDropped"` |
| `CHARACTER_SELECTED` | `"framework:characterSelected"` |
| `CHARACTER_CREATED` | `"framework:characterCreated"` |
| `CHARACTER_DELETED` | `"framework:characterDeleted"` |
| `INVENTORY_UPDATED` | `"framework:inventoryUpdated"` |
| `ITEM_USED` | `"framework:itemUsed"` |
| `ITEM_ADDED` | `"framework:itemAdded"` |
| `ITEM_REMOVED` | `"framework:itemRemoved"` |
| `JOB_UPDATED` | `"framework:jobUpdated"` |
| `DUTY_CHANGED` | `"framework:dutyChanged"` |
| `VEHICLE_SPAWNED` | `"framework:vehicleSpawned"` |
| `VEHICLE_STORED` | `"framework:vehicleStored"` |

### ClientEvents

| Constant | Value |
|----------|-------|
| `OPEN_CHARACTER_SELECT` | `"framework:openCharacterSelect"` |
| `OPEN_CHARACTER_CREATE` | `"framework:openCharacterCreate"` |
| `OPEN_INVENTORY` | `"framework:openInventory"` |
| `CLOSE_NUI` | `"framework:closeNui"` |
| `SHOW_NOTIFICATION` | `"framework:showNotification"` |
| `SPAWN_CHARACTER` | `"framework:spawnCharacter"` |
| `REFRESH_INVENTORY` | `"framework:refreshInventory"` |
| `VEHICLE_KEYS` | `"framework:vehicleKeys"` |

### NuiCallbacks

| Constant | Value |
|----------|-------|
| `GET_CHARACTERS` | `"getCharacters"` |
| `SELECT_CHARACTER` | `"selectCharacter"` |
| `DELETE_CHARACTER` | `"deleteCharacter"` |
| `CREATE_NEW_CHARACTER` | `"createNewCharacter"` |
| `SAVE_CHARACTER` | `"saveCharacter"` |
| `CANCEL_CHARACTER` | `"cancelCharacter"` |
| `UPDATE_APPEARANCE` | `"updateAppearance"` |
| `MOVE_ITEM` | `"moveItem"` |
| `USE_ITEM` | `"useItem"` |
| `DROP_ITEM` | `"dropItem"` |
| `CLOSE_INVENTORY` | `"closeInventory"` |

## Custom Events

When creating custom events, follow the naming convention:

```typescript
// Resource-specific events
"my-resource:myEvent"

// Good examples
"banking:deposit"
"housing:enterProperty"
"garage:spawnVehicle"

// Bad examples (too generic)
"deposit"
"spawn"
```
