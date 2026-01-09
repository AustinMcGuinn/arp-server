# Jobs Resource

The `jobs` resource provides a job/employment system with grades, salaries, duty status, and boss management.

## Overview

Features:

- Job definitions with grades
- Salary payments
- Duty on/off system
- Boss menu for hiring/firing
- Job-specific permissions

## Job Structure

```typescript
interface JobDefinition {
  name: string;           // Unique identifier (e.g., "police")
  label: string;          // Display name
  grades: JobGrade[];     // Available grades
  isDefault: boolean;     // Is this the default job
  defaultDuty: boolean;   // Start on duty when selected
}

interface JobGrade {
  grade: number;          // Grade level (0 = lowest)
  name: string;           // Grade identifier
  label: string;          // Grade display name
  salary: number;         // Payment amount
  isBoss: boolean;        // Can access boss menu
}
```

## Configuration

Define jobs in `resources/jobs/config.lua`:

```lua
Config.Jobs = {
    ["police"] = {
        label = "Los Santos Police Department",
        defaultDuty = false,
        grades = {
            { grade = 0, name = "cadet", label = "Cadet", salary = 500, isBoss = false },
            { grade = 1, name = "officer", label = "Officer", salary = 750, isBoss = false },
            { grade = 2, name = "sergeant", label = "Sergeant", salary = 1000, isBoss = false },
            { grade = 3, name = "lieutenant", label = "Lieutenant", salary = 1250, isBoss = false },
            { grade = 4, name = "captain", label = "Captain", salary = 1500, isBoss = true },
            { grade = 5, name = "chief", label = "Chief of Police", salary = 2000, isBoss = true },
        },
    },
    ["ambulance"] = {
        label = "Los Santos Medical Services",
        defaultDuty = false,
        grades = {
            { grade = 0, name = "emt", label = "EMT", salary = 500, isBoss = false },
            { grade = 1, name = "paramedic", label = "Paramedic", salary = 750, isBoss = false },
            { grade = 2, name = "doctor", label = "Doctor", salary = 1000, isBoss = false },
            { grade = 3, name = "chief", label = "Chief of Medicine", salary = 1500, isBoss = true },
        },
    },
    ["mechanic"] = {
        label = "Los Santos Customs",
        defaultDuty = true,
        grades = {
            { grade = 0, name = "trainee", label = "Trainee", salary = 400, isBoss = false },
            { grade = 1, name = "mechanic", label = "Mechanic", salary = 600, isBoss = false },
            { grade = 2, name = "manager", label = "Manager", salary = 900, isBoss = true },
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

## Exports

### getJob

Get job information for a player.

```typescript
exports["jobs"].getJob(source: number): PlayerJobData | null
```

```typescript
interface PlayerJobData {
  name: string;
  label: string;
  grade: number;
  gradeLabel: string;
  salary: number;
  isBoss: boolean;
  onDuty: boolean;
}
```

### setJob

Set a player's job and grade.

```typescript
exports["jobs"].setJob(source: number, jobName: string, grade: number): boolean
```

**Example:**

```typescript
// Promote to sergeant
exports["jobs"].setJob(source, "police", 2);
```

### hasJob

Check if a player has a specific job.

```typescript
exports["jobs"].hasJob(source: number, jobName: string): boolean
```

### isOnDuty

Check if a player is on duty.

```typescript
exports["jobs"].isOnDuty(source: number): boolean
```

### setDuty

Set a player's duty status.

```typescript
exports["jobs"].setDuty(source: number, onDuty: boolean): void
```

### isBoss

Check if a player has boss permissions for their job.

```typescript
exports["jobs"].isBoss(source: number): boolean
```

## Server Events

### jobs:toggleDuty

Toggle duty status.

```typescript
onNet("jobs:toggleDuty", () => {
  // Toggle on/off duty
});
```

### jobs:hire

Hire a player (boss menu).

```typescript
onNet("jobs:hire", (targetSource: number, grade: number) => {
  // Hire player to job
});
```

### jobs:fire

Fire a player (boss menu).

```typescript
onNet("jobs:fire", (targetCharacterId: number) => {
  // Fire player, set to unemployed
});
```

### jobs:setGrade

Change an employee's grade.

```typescript
onNet("jobs:setGrade", (targetCharacterId: number, grade: number) => {
  // Update grade
});
```

### jobs:openBossMenu

Open the boss management menu.

```typescript
onNet("jobs:openBossMenu", () => {
  // Open menu if player is boss
});
```

## Client Events

### jobs:dutyChanged

Notify client of duty change.

```typescript
onNet("jobs:dutyChanged", (onDuty: boolean) => {
  // Update UI, enable/disable features
});
```

### jobs:jobUpdated

Notify client of job change.

```typescript
onNet("jobs:jobUpdated", (jobData: PlayerJobData) => {
  // Update job display
});
```

## Salary System

Salaries can be paid on a schedule:

```lua
-- config.lua
Config.PaymentInterval = 60  -- minutes
Config.PaymentMultiplier = 1.0  -- Adjust all salaries
```

```typescript
// Server-side payment loop
setInterval(() => {
  const players = exports["[core]"].getPlayers();
  
  for (const player of players) {
    if (!player.character) continue;
    
    const job = exports["jobs"].getJob(player.source);
    if (!job || !job.onDuty || job.salary === 0) continue;
    
    const amount = Math.floor(job.salary * Config.PaymentMultiplier);
    exports["[core]"].addMoney(player.source, "bank", amount);
    
    emitNet("framework:showNotification", player.source, 
      "success", "Paycheck", `You received $${amount}`);
  }
}, Config.PaymentInterval * 60 * 1000);
```

## Boss Menu Features

Players with `isBoss: true` can:

1. **View Employees** - See all players with the same job
2. **Hire Players** - Add nearby players to the job
3. **Fire Employees** - Remove employees from the job
4. **Set Grades** - Promote/demote employees
5. **Manage Funds** - Access job funds (if implemented)

## Job-Specific Features

### Checking Job for Actions

```typescript
onNet("police:cuff", () => {
  const source = (globalThis as any).source as number;
  
  if (!exports["jobs"].hasJob(source, "police")) {
    emitNet("framework:showNotification", source, "error", "Error", "You are not a police officer");
    return;
  }
  
  if (!exports["jobs"].isOnDuty(source)) {
    emitNet("framework:showNotification", source, "error", "Error", "You must be on duty");
    return;
  }
  
  // Proceed with handcuffing
});
```

### Job-Specific Inventory Access

```typescript
on("inventory:canAccessStash", (source: number, stashId: string, cb: (allowed: boolean) => void) => {
  if (stashId.startsWith("police_evidence")) {
    cb(exports["jobs"].hasJob(source, "police") && exports["jobs"].isOnDuty(source));
  } else if (stashId.startsWith("hospital_supplies")) {
    cb(exports["jobs"].hasJob(source, "ambulance"));
  } else {
    cb(true);
  }
});
```

## Database Integration

Jobs are synced with the database:

```typescript
// Update character's job
await exports["[database]"].updateCharacterJob(characterId, "police", 2);

// Get all employees of a job
const employees = await exports["[database]"].getCharactersByJob("police");
```

## Events Emitted

### framework:jobUpdated

Emitted when a player's job changes.

```typescript
emit("framework:jobUpdated", source, oldJob, newJob);
```

### framework:dutyChanged

Emitted when duty status changes.

```typescript
emit("framework:dutyChanged", source, onDuty, jobName);
```

## Usage Examples

### Grant Job on Action

```typescript
// Player completes job application
onNet("cityhall:acceptJob", (jobName: string) => {
  const source = (globalThis as any).source as number;
  
  // Set to lowest grade
  exports["jobs"].setJob(source, jobName, 0);
  
  emitNet("framework:showNotification", source, 
    "success", "Employment", `You are now employed as ${jobName}`);
});
```

### Duty Toggle with Clothing

```typescript
onNet("jobs:toggleDuty", () => {
  const source = (globalThis as any).source as number;
  const job = exports["jobs"].getJob(source);
  
  if (!job) return;
  
  const newDuty = !job.onDuty;
  exports["jobs"].setDuty(source, newDuty);
  
  if (newDuty) {
    emitNet("clothing:setJobUniform", source, job.name, job.grade);
  } else {
    emitNet("clothing:setCivilian", source);
  }
});
```
