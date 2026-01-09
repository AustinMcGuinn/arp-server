# @framework/types

The types package provides TypeScript type definitions, Zod schemas, and event constants used throughout the framework.

## Installation

This package is internal to the monorepo and automatically available to all resources:

```typescript
import { FrameworkPlayer, Vector3, ServerEvents } from "@framework/types";
```

## Player Types

### PlayerIdentifiers

Player identifier information extracted from FiveM.

```typescript
interface PlayerIdentifiers {
  license: string;        // FiveM license (primary key)
  discord?: string;       // Discord ID
  steam?: string;         // Steam hex ID
  ip?: string;            // IP address
}
```

### FrameworkPlayer

Represents a connected player in the framework.

```typescript
interface FrameworkPlayer {
  source: number;                    // Server ID
  identifiers: PlayerIdentifiers;    // Player identifiers
  name: string;                      // Player name
  character: PlayerCharacter | null; // Active character (null if not selected)
}
```

### PlayerCharacter

Active character data for a player.

```typescript
interface PlayerCharacter {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;           // Computed: firstName + lastName
  dob: Date;
  gender: "male" | "female";
  cash: number;
  bank: number;
  job: PlayerJob;
  position: Vector3;
  isDead: boolean;
}
```

### PlayerJob

Job information for a character.

```typescript
interface PlayerJob {
  name: string;        // Job identifier (e.g., "police")
  label: string;       // Display name (e.g., "Police Department")
  grade: number;       // Grade level (0-indexed)
  gradeLabel: string;  // Grade display name (e.g., "Officer")
  onDuty: boolean;     // Whether player is on duty
}
```

## Vector Types

### Vector3

3D coordinate.

```typescript
interface Vector3 {
  x: number;
  y: number;
  z: number;
}
```

### Vector4

3D coordinate with heading (rotation).

```typescript
interface Vector4 extends Vector3 {
  w: number;  // Heading in degrees
}
```

## Character Types

### CharacterAppearance

Complete character appearance data for ped customization.

```typescript
interface CharacterAppearance {
  model: string;
  components: Record<number, {
    drawable: number;
    texture: number;
    palette?: number;
  }>;
  props: Record<number, {
    drawable: number;
    texture: number;
  }>;
  headBlend: {
    shapeFirst: number;
    shapeSecond: number;
    shapeThird: number;
    skinFirst: number;
    skinSecond: number;
    skinThird: number;
    shapeMix: number;
    skinMix: number;
    thirdMix: number;
  };
  faceFeatures: number[];
  headOverlays: Record<number, {
    index: number;
    opacity: number;
    color?: number;
    secondColor?: number;
  }>;
  hairColor: {
    primary: number;
    secondary: number;
  };
  eyeColor: number;
}
```

### CharacterData

Full character database record.

```typescript
interface CharacterData {
  id: number;
  ownerLicense: string;
  firstName: string;
  lastName: string;
  dob: Date;
  gender: "male" | "female";
  appearance: CharacterAppearance;
  position: { x: number; y: number; z: number; heading: number };
  cash: number;
  bank: number;
  jobName: string;
  jobGrade: number;
  isDead: boolean;
  createdAt: Date;
}
```

### CreateCharacterInput

Input for creating a new character (with Zod validation).

```typescript
const CreateCharacterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female"]),
  appearance: CharacterAppearanceSchema,
});

type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;
```

## Inventory Types

### ItemDefinition

Definition of an item type.

```typescript
interface ItemDefinition {
  name: string;           // Unique identifier
  label: string;          // Display name
  description: string;    // Item description
  weight: number;         // Weight in grams
  stackable: boolean;     // Can stack in same slot
  maxStack: number;       // Maximum stack size
  usable: boolean;        // Has use action
  unique: boolean;        // Each instance is unique
  image: string;          // Image filename
  category: ItemCategory;
}

type ItemCategory =
  | "weapon"
  | "ammo"
  | "food"
  | "drink"
  | "medical"
  | "crafting"
  | "clothing"
  | "misc";
```

### InventoryItem

An item instance in an inventory slot.

```typescript
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

### Inventory

An inventory container.

```typescript
interface Inventory {
  id: string;
  type: InventoryType;
  label: string;
  slots: number;
  maxWeight: number;
  items: InventoryItem[];
}

type InventoryType =
  | "player"
  | "vehicle"
  | "stash"
  | "glovebox"
  | "trunk"
  | "drop"
  | "shop";
```

### MoveItemInput

Input for moving items between inventories.

```typescript
const MoveItemSchema = z.object({
  fromInventory: z.string(),
  toInventory: z.string(),
  fromSlot: z.number().int().positive(),
  toSlot: z.number().int().positive(),
  count: z.number().int().positive(),
});
```

## Vehicle Types

### OwnedVehicle

A player-owned vehicle.

```typescript
interface OwnedVehicle {
  id: number;
  ownerLicense: string;
  characterId: number;
  plate: string;
  model: string;
  mods: Partial<VehicleMods>;
  fuel: number;
  bodyHealth: number;
  engineHealth: number;
  garage: string;
  state: VehicleState;
}

type VehicleState = "out" | "garaged" | "impounded" | "destroyed";
```

### VehicleMods

Vehicle modification data.

```typescript
interface VehicleMods {
  modEngine: number;
  modBrakes: number;
  modTransmission: number;
  modSuspension: number;
  modArmor: number;
  modTurbo: boolean;
  modSmokeEnabled: boolean;
  modXenon: boolean;
  windowTint: number;
  neonEnabled: [boolean, boolean, boolean, boolean];
  neonColor: [number, number, number];
  tyreSmokeColor: [number, number, number];
  wheels: number;
  wheelType: number;
  extras: Record<number, boolean>;
  livery: number;
  plateIndex: number;
  color1: number | [number, number, number];
  color2: number | [number, number, number];
  pearlescentColor: number;
  wheelColor: number;
  dashboardColor: number;
  interiorColor: number;
}
```

### GarageLocation

A garage location definition.

```typescript
interface GarageLocation {
  id: string;
  label: string;
  position: { x: number; y: number; z: number };
  spawnPoints: Array<{ x: number; y: number; z: number; heading: number }>;
  vehicleTypes: VehicleType[];
}

type VehicleType = "car" | "motorcycle" | "boat" | "aircraft" | "bicycle";
```

## Job Types

### JobDefinition

A job definition with grades.

```typescript
interface JobDefinition {
  name: string;
  label: string;
  grades: JobGrade[];
  isDefault: boolean;
  defaultDuty: boolean;
}

interface JobGrade {
  grade: number;
  name: string;
  label: string;
  salary: number;
  isBoss: boolean;
}
```

## NUI Types

### NuiMessage

Message format for NUI communication.

```typescript
interface NuiMessage<T = unknown> {
  action: string;
  data: T;
}
```

### NuiResponse

Standard response format from NUI callbacks.

```typescript
interface NuiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### NotificationData

Notification display data.

```typescript
interface NotificationData {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration: number;  // milliseconds
}
```

## Event Constants

See [Events Reference](../development/events-reference.md) for complete event documentation.

```typescript
import { ServerEvents, ClientEvents, NuiCallbacks } from "@framework/types";

// Server events
ServerEvents.PLAYER_LOADED       // "framework:playerLoaded"
ServerEvents.CHARACTER_SELECTED  // "framework:characterSelected"

// Client events
ClientEvents.OPEN_INVENTORY      // "framework:openInventory"
ClientEvents.SHOW_NOTIFICATION   // "framework:showNotification"

// NUI callbacks
NuiCallbacks.SELECT_CHARACTER    // "selectCharacter"
NuiCallbacks.MOVE_ITEM          // "moveItem"
```
