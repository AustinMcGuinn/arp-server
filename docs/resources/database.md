# Database Resource

The `[database]` resource provides database connectivity and query functions using Drizzle ORM with PlanetScale.

## Overview

Features:

- PlanetScale MySQL connection
- Drizzle ORM for type-safe queries
- Pre-built query functions for all entities
- Database schema with relations
- Exports for other resources

## Schema

### Users Table

Stores player accounts (one per license).

```typescript
const users = mysqlTable("users", {
  license: varchar("license", { length: 60 }).primaryKey(),
  discordId: varchar("discord_id", { length: 30 }),
  steamId: varchar("steam_id", { length: 30 }),
  tokens: int("tokens").default(0).notNull(),
  createdAt: datetime("created_at").defaultNow().notNull(),
  lastSeen: datetime("last_seen").defaultNow().notNull(),
});
```

### Characters Table

Player characters.

```typescript
const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  ownerLicense: varchar("owner_license", { length: 60 }).notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  dob: datetime("dob").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  appearance: json("appearance").notNull(),
  position: json("position").notNull(),
  cash: int("cash").default(500).notNull(),
  bank: int("bank").default(5000).notNull(),
  jobName: varchar("job_name", { length: 50 }).default("unemployed").notNull(),
  jobGrade: int("job_grade").default(0).notNull(),
  isDead: boolean("is_dead").default(false).notNull(),
  createdAt: datetime("created_at").defaultNow().notNull(),
  lastPlayed: datetime("last_played").defaultNow().notNull(),
});
```

### Inventories Table

Inventory storage for players, vehicles, stashes.

```typescript
const inventories = mysqlTable("inventories", {
  id: int("id").autoincrement().primaryKey(),
  inventoryType: varchar("inventory_type", { length: 20 }).notNull(),
  inventoryId: varchar("inventory_id", { length: 100 }).notNull(),
  items: json("items").default([]).notNull(),
  maxWeight: int("max_weight").default(100000).notNull(),
});
```

### Vehicles Table

Player-owned vehicles.

```typescript
const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  ownerLicense: varchar("owner_license", { length: 60 }).notNull(),
  characterId: int("character_id").notNull(),
  plate: varchar("plate", { length: 8 }).notNull().unique(),
  model: varchar("model", { length: 50 }).notNull(),
  mods: json("mods").default({}).notNull(),
  fuel: float("fuel").default(100).notNull(),
  bodyHealth: float("body_health").default(1000).notNull(),
  engineHealth: float("engine_health").default(1000).notNull(),
  garage: varchar("garage", { length: 50 }).default("legion").notNull(),
  state: varchar("state", { length: 20 }).default("garaged").notNull(),
});
```

### Jobs Table

Job definitions.

```typescript
const jobs = mysqlTable("jobs", {
  name: varchar("name", { length: 50 }).primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  grades: json("grades").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});
```

## Entity Relationships

```mermaid
erDiagram
    users ||--o{ characters : has
    users ||--o{ vehicles : owns
    characters ||--o{ vehicles : drives
    characters }o--|| jobs : has
```

## Exports

### User Queries

#### getUser

```typescript
exports["[database]"].getUser(license: string): Promise<User | undefined>
```

#### createUser

```typescript
exports["[database]"].createUser(data: NewUser): Promise<void>
```

#### updateUser

```typescript
exports["[database]"].updateUser(license: string, data: Partial<User>): Promise<void>
```

### Character Queries

#### getCharactersByLicense

Get all characters for a player.

```typescript
exports["[database]"].getCharactersByLicense(license: string): Promise<Character[]>
```

**Example:**

```typescript
const characters = await exports["[database]"].getCharactersByLicense("license:abc123...");
console.log(`Found ${characters.length} characters`);
```

#### getCharacterById

```typescript
exports["[database]"].getCharacterById(id: number): Promise<Character | undefined>
```

#### createCharacter

```typescript
exports["[database]"].createCharacter(data: NewCharacter): Promise<number>
```

**Returns:** The new character's ID.

**Example:**

```typescript
const characterId = await exports["[database]"].createCharacter({
  ownerLicense: "license:abc123...",
  firstName: "John",
  lastName: "Doe",
  dob: new Date("1990-01-15"),
  gender: "male",
  appearance: { ... },
  position: { x: -269.4, y: -955.3, z: 31.2, heading: 205.0 },
});
```

#### updateCharacter

```typescript
exports["[database]"].updateCharacter(id: number, data: Partial<Character>): Promise<void>
```

#### deleteCharacter

```typescript
exports["[database]"].deleteCharacter(id: number, ownerLicense: string): Promise<boolean>
```

**Returns:** `true` if deleted, `false` if not found or not owner.

#### updateCharacterPosition

```typescript
exports["[database]"].updateCharacterPosition(
  id: number, 
  position: { x: number; y: number; z: number; heading: number }
): Promise<void>
```

#### updateCharacterMoney

```typescript
exports["[database]"].updateCharacterMoney(id: number, cash: number, bank: number): Promise<void>
```

#### updateCharacterJob

```typescript
exports["[database]"].updateCharacterJob(id: number, jobName: string, jobGrade: number): Promise<void>
```

#### setCharacterDead

```typescript
exports["[database]"].setCharacterDead(id: number, isDead: boolean): Promise<void>
```

### Inventory Queries

#### getInventory

```typescript
exports["[database]"].getInventory(type: string, id: string): Promise<Inventory | undefined>
```

**Example:**

```typescript
// Get player inventory
const inventory = await exports["[database]"].getInventory("player", `char:${characterId}`);

// Get vehicle trunk
const trunk = await exports["[database]"].getInventory("trunk", `vehicle:${plate}`);
```

#### createInventory

```typescript
exports["[database]"].createInventory(type: string, id: string, maxWeight?: number): Promise<void>
```

#### updateInventoryItems

```typescript
exports["[database]"].updateInventoryItems(type: string, id: string, items: InventoryItem[]): Promise<void>
```

### Vehicle Queries

#### getVehiclesByCharacter

```typescript
exports["[database]"].getVehiclesByCharacter(characterId: number): Promise<Vehicle[]>
```

#### getVehicleByPlate

```typescript
exports["[database]"].getVehicleByPlate(plate: string): Promise<Vehicle | undefined>
```

#### createVehicle

```typescript
exports["[database]"].createVehicle(data: NewVehicle): Promise<number>
```

#### updateVehicle

```typescript
exports["[database]"].updateVehicle(id: number, data: Partial<Vehicle>): Promise<void>
```

#### updateVehicleState

```typescript
exports["[database]"].updateVehicleState(id: number, state: VehicleState): Promise<void>
```

### Job Queries

#### getAllJobs

```typescript
exports["[database]"].getAllJobs(): Promise<Job[]>
```

#### getJob

```typescript
exports["[database]"].getJob(name: string): Promise<Job | undefined>
```

#### createJob

```typescript
exports["[database]"].createJob(data: NewJob): Promise<void>
```

## Configuration

The database URL is set via server convar:

```cfg
set database_url "mysql://username:password@host/database?ssl={\"rejectUnauthorized\":true}"
```

## Usage Examples

### Saving player on disconnect

```typescript
on("framework:playerDropped", async (source: number, player: FrameworkPlayer) => {
  if (!player.character) return;
  
  const ped = GetPlayerPed(String(source));
  const coords = GetEntityCoords(ped);
  
  await exports["[database]"].updateCharacter(player.character.id, {
    position: { x: coords[0], y: coords[1], z: coords[2], heading: 0 },
    cash: player.character.cash,
    bank: player.character.bank,
    lastPlayed: new Date(),
  });
});
```

### Giving a player a vehicle

```typescript
async function giveVehicle(source: number, model: string) {
  const player = exports["[core]"].getPlayer(source);
  const character = exports["[core]"].getCharacter(source);
  
  if (!player || !character) return;
  
  const plate = generatePlate(); // from @framework/utils
  
  const vehicleId = await exports["[database]"].createVehicle({
    ownerLicense: player.identifiers.license,
    characterId: character.id,
    plate,
    model,
    garage: "legion",
    state: "garaged",
  });
  
  emitNet("framework:showNotification", source, "success", "Vehicle", `You received a ${model}!`);
}
```

## Database Management

### View Database

Use Drizzle Studio to view and edit data:

```bash
pnpm db:studio
```

### Push Schema Changes

After modifying the schema:

```bash
pnpm db:push
```

### Generate Migrations

For production deployments:

```bash
pnpm db:generate
```
