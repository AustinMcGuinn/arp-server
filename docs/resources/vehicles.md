# Vehicles Resource

The `vehicles` resource provides vehicle ownership, garages, and persistent vehicle storage.

## Overview

Features:

- Vehicle ownership system
- Multiple garage locations
- Vehicle modifications persistence
- Fuel, health, and damage tracking
- Impound system
- Vehicle spawning with saved state

## Vehicle Structure

```typescript
interface OwnedVehicle {
  id: number;               // Database ID
  ownerLicense: string;     // Owner's license
  characterId: number;      // Owning character
  plate: string;            // Unique plate
  model: string;            // Vehicle model name
  mods: Partial<VehicleMods>;
  fuel: number;             // 0-100
  bodyHealth: number;       // 0-1000
  engineHealth: number;     // 0-1000
  garage: string;           // Current garage ID
  state: VehicleState;      // Current state
}

type VehicleState = "out" | "garaged" | "impounded" | "destroyed";
```

## Garage Configuration

Define garages in `resources/vehicles/config.lua`:

```lua
Config.Garages = {
    ["legion"] = {
        label = "Legion Square Parking",
        position = { x = 215.8, y = -810.0, z = 30.7 },
        spawnPoints = {
            { x = 228.5, y = -800.5, z = 30.5, heading = 160.0 },
            { x = 232.5, y = -797.5, z = 30.5, heading = 160.0 },
            { x = 236.5, y = -794.5, z = 30.5, heading = 160.0 },
        },
        vehicleTypes = { "car", "motorcycle" },
        blipSprite = 357,
        blipColor = 3,
    },
    ["airport"] = {
        label = "LSIA Hangar",
        position = { x = -1025.0, y = -3015.0, z = 13.9 },
        spawnPoints = {
            { x = -1030.0, y = -3010.0, z = 13.9, heading = 60.0 },
        },
        vehicleTypes = { "aircraft" },
        blipSprite = 359,
        blipColor = 2,
    },
    ["docks"] = {
        label = "Docks Marina",
        position = { x = -729.0, y = -1355.0, z = 1.6 },
        spawnPoints = {
            { x = -725.0, y = -1350.0, z = 0.0, heading = 140.0 },
        },
        vehicleTypes = { "boat" },
        blipSprite = 356,
        blipColor = 26,
    },
}
```

## Vehicle Types

| Type | Description | Examples |
|------|-------------|----------|
| `car` | Standard vehicles | Sedans, SUVs, sports cars |
| `motorcycle` | Two-wheelers | Bikes, scooters |
| `boat` | Water vehicles | Boats, jet skis |
| `aircraft` | Flying vehicles | Planes, helicopters |
| `bicycle` | Pedal bikes | BMX, mountain bikes |

## Exports

### getVehicles

Get all vehicles for a character.

```typescript
exports["vehicles"].getVehicles(characterId: number): Promise<OwnedVehicle[]>
```

### getVehicle

Get a specific vehicle by plate.

```typescript
exports["vehicles"].getVehicle(plate: string): Promise<OwnedVehicle | undefined>
```

### giveVehicle

Give a new vehicle to a player.

```typescript
exports["vehicles"].giveVehicle(
  source: number,
  model: string,
  garage?: string
): Promise<number | null>  // Returns vehicle ID or null
```

**Example:**

```typescript
const vehicleId = await exports["vehicles"].giveVehicle(source, "adder", "legion");
if (vehicleId) {
  emitNet("framework:showNotification", source, "success", "Vehicle", "You received a new Adder!");
}
```

### spawnVehicle

Spawn a player's vehicle from garage.

```typescript
exports["vehicles"].spawnVehicle(source: number, vehicleId: number): Promise<boolean>
```

### storeVehicle

Store a vehicle back in garage.

```typescript
exports["vehicles"].storeVehicle(source: number, vehicleNetId: number): Promise<boolean>
```

### updateVehicle

Update vehicle data.

```typescript
exports["vehicles"].updateVehicle(plate: string, data: Partial<OwnedVehicle>): Promise<void>
```

## Server Events

### vehicles:getGarageVehicles

Get vehicles in a specific garage.

```typescript
onNet("vehicles:getGarageVehicles", (garageId: string) => {
  // Returns list of vehicles in this garage
});
```

### vehicles:spawnVehicle

Spawn a vehicle from garage.

```typescript
onNet("vehicles:spawnVehicle", (vehicleId: number, garageId: string) => {
  // Spawn vehicle at garage spawn point
});
```

### vehicles:storeVehicle

Store the current vehicle.

```typescript
onNet("vehicles:storeVehicle", (garageId: string) => {
  // Store player's current vehicle
});
```

### vehicles:impound

Impound a vehicle (admin/police).

```typescript
onNet("vehicles:impound", (plate: string, reason?: string) => {
  // Set vehicle state to impounded
});
```

### vehicles:retrieveFromImpound

Retrieve vehicle from impound.

```typescript
onNet("vehicles:retrieveFromImpound", (vehicleId: number) => {
  // Pay fee and retrieve vehicle
});
```

## Client Events

### vehicles:openGarage

Open the garage UI.

```typescript
emitNet("vehicles:openGarage", source, {
  garageId: "legion",
  vehicles: [...],
  spawnPoints: [...]
});
```

### vehicles:spawnVehicle

Spawn a vehicle client-side.

```typescript
emitNet("vehicles:spawnVehicle", source, {
  model: "adder",
  plate: "ABC123",
  position: { x, y, z, heading },
  mods: {...},
  fuel: 75,
  bodyHealth: 950,
  engineHealth: 1000
});
```

## Vehicle Mods Structure

```typescript
interface VehicleMods {
  modEngine: number;        // 0-3
  modBrakes: number;        // 0-3
  modTransmission: number;  // 0-3
  modSuspension: number;    // 0-3
  modArmor: number;         // 0-4
  modTurbo: boolean;
  modSmokeEnabled: boolean;
  modXenon: boolean;
  windowTint: number;       // 0-6
  neonEnabled: [boolean, boolean, boolean, boolean];  // left, right, front, back
  neonColor: [number, number, number];  // RGB
  tyreSmokeColor: [number, number, number];  // RGB
  wheels: number;           // Wheel index
  wheelType: number;        // Wheel type category
  extras: Record<number, boolean>;  // Vehicle extras
  livery: number;
  plateIndex: number;       // Plate style
  color1: number | [number, number, number];  // Primary color
  color2: number | [number, number, number];  // Secondary color
  pearlescentColor: number;
  wheelColor: number;
  dashboardColor: number;
  interiorColor: number;
}
```

## Saving Vehicle State

Vehicles are saved when stored or when player disconnects:

```typescript
// Get current vehicle properties
function getVehicleProperties(vehicle: number): VehicleMods {
  return {
    modEngine: GetVehicleMod(vehicle, 11),
    modBrakes: GetVehicleMod(vehicle, 12),
    modTransmission: GetVehicleMod(vehicle, 13),
    modSuspension: GetVehicleMod(vehicle, 15),
    modArmor: GetVehicleMod(vehicle, 16),
    modTurbo: IsToggleModOn(vehicle, 18),
    // ... other properties
  };
}

// Save to database
const mods = getVehicleProperties(vehicle);
const fuel = GetVehicleFuelLevel(vehicle);
const bodyHealth = GetVehicleBodyHealth(vehicle);
const engineHealth = GetVehicleEngineHealth(vehicle);

await exports["[database]"].updateVehicle(vehicleId, {
  mods,
  fuel,
  bodyHealth,
  engineHealth
});
```

## Applying Vehicle Mods

```typescript
function setVehicleProperties(vehicle: number, mods: VehicleMods): void {
  SetVehicleModKit(vehicle, 0);
  
  SetVehicleMod(vehicle, 11, mods.modEngine, false);
  SetVehicleMod(vehicle, 12, mods.modBrakes, false);
  SetVehicleMod(vehicle, 13, mods.modTransmission, false);
  SetVehicleMod(vehicle, 15, mods.modSuspension, false);
  SetVehicleMod(vehicle, 16, mods.modArmor, false);
  
  ToggleVehicleMod(vehicle, 18, mods.modTurbo);
  ToggleVehicleMod(vehicle, 20, mods.modSmokeEnabled);
  ToggleVehicleMod(vehicle, 22, mods.modXenon);
  
  // Colors
  if (Array.isArray(mods.color1)) {
    SetVehicleCustomPrimaryColour(vehicle, ...mods.color1);
  } else {
    SetVehicleColours(vehicle, mods.color1, GetVehicleColours(vehicle)[1]);
  }
  
  // ... apply other mods
}
```

## Impound System

```lua
Config.ImpoundLocation = {
    position = { x = 400.0, y = -1630.0, z = 29.3 },
    spawnPoints = {
        { x = 405.0, y = -1625.0, z = 29.3, heading = 90.0 },
    },
    fee = 500,  -- Base retrieval fee
    feePerHour = 50,  -- Additional per hour impounded
}
```

## Vehicle Keys

Vehicles track who has keys:

```typescript
// Give keys to another player
emitNet("vehicles:giveKeys", targetSource, plate);

// Check if player has keys
const hasKeys = await exports["vehicles"].hasKeys(source, plate);
```

## Usage Examples

### Dealership Purchase

```typescript
onNet("dealership:purchase", async (model: string, price: number) => {
  const source = (globalThis as any).source as number;
  
  if (!exports["[core]"].removeMoney(source, "bank", price)) {
    emitNet("framework:showNotification", source, "error", "Error", "Insufficient funds");
    return;
  }
  
  const vehicleId = await exports["vehicles"].giveVehicle(source, model, "legion");
  
  if (vehicleId) {
    emitNet("framework:showNotification", source, "success", "Purchase", 
      `Congratulations! Your ${model} is waiting at Legion Square Parking.`);
  }
});
```

### Police Impounding

```typescript
onNet("police:impoundVehicle", (plate: string, reason: string) => {
  const source = (globalThis as any).source as number;
  
  if (!exports["jobs"].hasJob(source, "police") || !exports["jobs"].isOnDuty(source)) {
    return;
  }
  
  exports["vehicles"].impoundVehicle(plate, reason);
  emitNet("framework:showNotification", source, "success", "Impound", `Vehicle ${plate} impounded`);
});
```

### Garage Interaction

```typescript
// Client-side: Near garage marker
onNet("vehicles:nearGarage", (garageId: string) => {
  // Show interaction prompt
  DrawText3D(garagePos, "[E] Open Garage");
  
  if (IsControlJustPressed(0, 38)) { // E key
    emitNet("vehicles:getGarageVehicles", garageId);
  }
});
```
