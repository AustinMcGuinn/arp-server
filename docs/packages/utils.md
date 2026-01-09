# @framework/utils

The utils package provides shared utility functions for math, validation, formatting, and random generation.

## Installation

This package is internal to the monorepo:

```typescript
import { distance, formatCurrency, uuid } from "@framework/utils";
```

## Math Utilities

### distance

Calculate the distance between two 3D points.

```typescript
function distance(a: Vector3, b: Vector3): number
```

**Example:**

```typescript
import { distance } from "@framework/utils";

const playerPos = { x: 100, y: 200, z: 30 };
const targetPos = { x: 150, y: 220, z: 30 };

const dist = distance(playerPos, targetPos);
console.log(dist); // ~53.85
```

### distance2d

Calculate 2D distance (ignoring Z axis).

```typescript
function distance2d(a: Vector3, b: Vector3): number
```

**Example:**

```typescript
const dist2d = distance2d(playerPos, targetPos);
// Useful for ground-level distance checks
```

### isNear

Check if a point is within a certain distance of another.

```typescript
function isNear(a: Vector3, b: Vector3, maxDistance: number): boolean
```

**Example:**

```typescript
if (isNear(playerPos, shopPos, 5.0)) {
  // Player is within 5 units of shop
  openShopMenu();
}
```

### clamp

Clamp a value between min and max.

```typescript
function clamp(value: number, min: number, max: number): number
```

**Example:**

```typescript
const health = clamp(playerHealth, 0, 100);
```

### lerp

Linear interpolation between two values.

```typescript
function lerp(a: number, b: number, t: number): number
```

**Example:**

```typescript
// Smoothly animate from 0 to 100 over time
const currentValue = lerp(0, 100, progress); // progress: 0-1
```

### headingToDirection

Convert heading (degrees) to direction vector.

```typescript
function headingToDirection(heading: number): Vector3
```

**Example:**

```typescript
const direction = headingToDirection(90);
// Returns unit vector pointing in that direction
```

### vec3 / vec4

Helper functions to create vectors.

```typescript
function vec3(x: number, y: number, z: number): Vector3
function vec4(x: number, y: number, z: number, w: number): Vector4
```

**Example:**

```typescript
const position = vec3(100, 200, 30);
const spawn = vec4(100, 200, 30, 180); // with heading
```

### vec4ToVec3

Convert Vector4 to Vector3 (drops heading).

```typescript
function vec4ToVec3(v: Vector4): Vector3
```

## Validation Utilities

### safeParse

Safely parse data with a Zod schema, returning success/error.

```typescript
function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError }
```

**Example:**

```typescript
import { safeParse } from "@framework/utils";
import { CreateCharacterSchema } from "@framework/types";

const result = safeParse(CreateCharacterSchema, inputData);
if (result.success) {
  createCharacter(result.data);
} else {
  console.error(result.error.issues);
}
```

### parse

Parse data with a Zod schema, throwing on error.

```typescript
function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T>
```

**Example:**

```typescript
try {
  const data = parse(MoveItemSchema, input);
  moveItem(data);
} catch (error) {
  // Handle validation error
}
```

### isValidLicense

Validate a FiveM license identifier format.

```typescript
function isValidLicense(license: string): boolean
```

**Example:**

```typescript
isValidLicense("license:abc123def456..."); // true/false
```

### isValidDiscordId

Validate a Discord identifier format.

```typescript
function isValidDiscordId(id: string): boolean
```

**Example:**

```typescript
isValidDiscordId("discord:123456789012345678"); // true
```

### isValidSteamId

Validate a Steam hex identifier format.

```typescript
function isValidSteamId(id: string): boolean
```

### isValidPlate

Validate a vehicle plate format (1-8 alphanumeric characters).

```typescript
function isValidPlate(plate: string): boolean
```

**Example:**

```typescript
isValidPlate("ABC123"); // true
isValidPlate("TOO LONG PLATE"); // false
```

## Format Utilities

### formatCurrency

Format a number as USD currency.

```typescript
function formatCurrency(amount: number): string
```

**Example:**

```typescript
formatCurrency(1500);    // "$1,500"
formatCurrency(1000000); // "$1,000,000"
```

### formatNumber

Format a number with comma separators.

```typescript
function formatNumber(num: number): string
```

**Example:**

```typescript
formatNumber(1234567); // "1,234,567"
```

### formatDate

Format a Date to readable string.

```typescript
function formatDate(date: Date): string
```

**Example:**

```typescript
formatDate(new Date()); // "January 9, 2026"
```

### formatTime

Format seconds to time string (HH:MM:SS or MM:SS).

```typescript
function formatTime(seconds: number): string
```

**Example:**

```typescript
formatTime(65);    // "1:05"
formatTime(3661);  // "1:01:01"
```

### titleCase

Capitalize first letter of each word.

```typescript
function titleCase(str: string): string
```

**Example:**

```typescript
titleCase("john doe"); // "John Doe"
```

### truncate

Truncate string with ellipsis.

```typescript
function truncate(str: string, maxLength: number): string
```

**Example:**

```typescript
truncate("This is a long description", 15); // "This is a lo..."
```

### formatWeight

Format weight in grams to readable string.

```typescript
function formatWeight(grams: number): string
```

**Example:**

```typescript
formatWeight(500);  // "500g"
formatWeight(1500); // "1.5kg"
```

## Random Utilities

### randomInt

Generate a random integer between min and max (inclusive).

```typescript
function randomInt(min: number, max: number): number
```

**Example:**

```typescript
const damage = randomInt(10, 25);
```

### randomFloat

Generate a random float between min and max.

```typescript
function randomFloat(min: number, max: number): number
```

**Example:**

```typescript
const chance = randomFloat(0, 1);
```

### randomElement

Pick a random element from an array.

```typescript
function randomElement<T>(arr: T[]): T | undefined
```

**Example:**

```typescript
const weapons = ["pistol", "rifle", "shotgun"];
const weapon = randomElement(weapons);
```

### generatePlate

Generate a random 8-character vehicle plate.

```typescript
function generatePlate(): string
```

**Example:**

```typescript
const plate = generatePlate(); // e.g., "ABC12345"
```

### uuid

Generate a UUID v4.

```typescript
function uuid(): string
```

**Example:**

```typescript
const id = uuid(); // "550e8400-e29b-41d4-a716-446655440000"
```

### shuffle

Shuffle an array (returns new array).

```typescript
function shuffle<T>(arr: T[]): T[]
```

**Example:**

```typescript
const cards = [1, 2, 3, 4, 5];
const shuffled = shuffle(cards);
```

## Usage in Resources

```typescript
// resources/[core]/src/server/index.ts
import { isNear, formatCurrency, uuid } from "@framework/utils";

// Check if player is near ATM
if (isNear(playerPos, atmPos, 2.0)) {
  const transactionId = uuid();
  console.log(`Player withdrew ${formatCurrency(amount)}`);
}
```
