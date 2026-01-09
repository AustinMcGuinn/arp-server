# Architecture

This document provides an overview of the framework's architecture, including the monorepo structure, communication patterns, and data flow.

## Monorepo Structure

The framework uses a pnpm workspace monorepo with the following structure:

```
├── packages/           # Shared internal packages
│   ├── types/          # @framework/types
│   ├── utils/          # @framework/utils
│   └── ui/             # @framework/ui
│
├── resources/          # FiveM resources
│   ├── [core]/         # Core framework
│   ├── [database]/     # Database layer
│   ├── [websocket]/    # WebSocket server
│   └── ...             # Game resources
│
├── apps/               # External applications
│   └── admin-panel/    # Web admin dashboard
│
└── scripts/            # Build scripts
```

## System Overview

```mermaid
flowchart TB
    subgraph FiveMServer[FiveM Server]
        Core[Core Resource]
        DB[Database Resource]
        WS[WebSocket Resource]
        CharSelect[Character Selection]
        CharCreate[Character Creation]
        Inventory[Inventory]
        Jobs[Jobs]
        Vehicles[Vehicles]
    end
    
    subgraph Players[Connected Players]
        Player1[Player Client]
        Player2[Player Client]
    end
    
    subgraph External[External Apps]
        AdminPanel[Admin Panel]
    end
    
    subgraph Storage[Data Storage]
        PlanetScale[(PlanetScale DB)]
    end
    
    Player1 -->|Events| Core
    Player2 -->|Events| Core
    Core --> DB
    CharSelect --> Core
    CharCreate --> Core
    Inventory --> Core
    Jobs --> Core
    Vehicles --> Core
    DB --> PlanetScale
    WS <-->|WebSocket| AdminPanel
    Core -.->|Broadcasts| WS
```

## Layer Architecture

### 1. Packages Layer

Shared code used across resources and apps:

| Package | Purpose |
|---------|---------|
| `@framework/types` | TypeScript interfaces, Zod schemas, event names |
| `@framework/utils` | Math, validation, formatting, random utilities |
| `@framework/ui` | SolidJS components and hooks for NUI |

### 2. Core Resources Layer

Foundation resources that other resources depend on:

```mermaid
flowchart LR
    Core[Core] --> DB[Database]
    WS[WebSocket] --> Core
    GameResources[Game Resources] --> Core
    GameResources --> DB
```

- **[core]**: Player management, permissions, exports for other resources
- **[database]**: Drizzle ORM, schema, query functions
- **[websocket]**: External communication via WebSocket

### 3. Game Resources Layer

Feature resources that implement game functionality:

- Character selection/creation
- Inventory management
- Job system
- Vehicle ownership

### 4. Apps Layer

External applications that communicate via WebSocket:

- Admin Panel (React + TypeScript)

## Communication Patterns

### Client ↔ Server Events

FiveM native events for client-server communication:

```typescript
// Client → Server
emitNet("framework:selectCharacter", characterId);

// Server → Client
emitNet("framework:spawnCharacter", source, characterData);

// Server → All Clients
emitNet("framework:playerJoined", -1, playerData);
```

### NUI ↔ Client Communication

NUI (browser) communicates with Lua/JS client via callbacks:

```mermaid
sequenceDiagram
    participant NUI as NUI (Browser)
    participant Client as Client Script
    participant Server as Server Script
    
    NUI->>Client: fetchNui("selectCharacter", {id: 1})
    Client->>Server: emitNet("selectCharacter", id)
    Server->>Server: Load character data
    Server->>Client: emitNet("characterData", data)
    Client->>NUI: SendNUIMessage({action: "characterLoaded", data})
```

### Resource Exports

Resources expose functions for other resources to use:

```typescript
// In [core] resource
exports("getPlayer", (source: number) => playerManager.getPlayer(source));

// In another resource
const player = exports["[core]"].getPlayer(source);
```

### WebSocket Communication

External apps connect via WebSocket with JWT authentication:

```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant WS as WebSocket Server
    participant Core as Core Resource
    
    Admin->>WS: Connect
    WS->>Admin: {event: "connected", clientId}
    Admin->>WS: {event: "auth", token: "jwt..."}
    WS->>WS: Verify JWT
    WS->>Admin: {event: "authenticated"}
    Admin->>WS: {event: "getPlayers"}
    WS->>Core: Request players
    Core->>WS: Player list
    WS->>Admin: {event: "players", data: [...]}
```

## Data Flow

### Player Connection Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant C as Core
    participant DB as Database
    
    P->>C: playerConnecting
    C->>C: Extract identifiers
    C->>DB: Get/create user
    DB->>C: User data
    C->>P: Defer done (allow connection)
    P->>C: playerJoining
    C->>P: Open character selection
```

### Character Selection Flow

```mermaid
sequenceDiagram
    participant NUI as Character Select UI
    participant Client as Client Script
    participant Server as Server Script
    participant DB as Database
    
    Client->>NUI: Open UI
    NUI->>Client: getCharacters callback
    Client->>Server: Request characters
    Server->>DB: Query characters
    DB->>Server: Character list
    Server->>Client: Character data
    Client->>NUI: Display characters
    NUI->>Client: selectCharacter(id)
    Client->>Server: Select character
    Server->>Server: Set active character
    Server->>Client: Spawn player
```

## Database Schema

Entity relationship diagram:

```mermaid
erDiagram
    users ||--o{ characters : has
    users ||--o{ vehicles : owns
    characters ||--o{ vehicles : drives
    characters }o--|| jobs : has
    
    users {
        string license PK
        string discord_id
        string steam_id
        int tokens
        datetime created_at
        datetime last_seen
    }
    
    characters {
        int id PK
        string owner_license FK
        string first_name
        string last_name
        datetime dob
        string gender
        json appearance
        json position
        int cash
        int bank
        string job_name FK
        int job_grade
        boolean is_dead
    }
    
    vehicles {
        int id PK
        string owner_license FK
        int character_id FK
        string plate UK
        string model
        json mods
        float fuel
        float body_health
        float engine_health
        string garage
        string state
    }
    
    inventories {
        int id PK
        string inventory_type
        string inventory_id
        json items
        int max_weight
    }
    
    jobs {
        string name PK
        string label
        json grades
        boolean is_default
    }
```

## Build System

The framework uses Turbo for monorepo builds:

```bash
# Build all packages and resources
pnpm build

# Watch mode for development
pnpm build:watch

# Build specific resource
pnpm --filter character-selection build
```

### Build Pipeline

```mermaid
flowchart LR
    Types[types] --> Utils[utils]
    Types --> UI[ui]
    Utils --> Resources[Resources]
    UI --> NUI[NUI Apps]
    Types --> Resources
```

Packages are built first, then resources can import from them.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Server Scripts | TypeScript (esbuild) |
| Client Scripts | TypeScript (esbuild) |
| Database | PlanetScale (MySQL) + Drizzle ORM |
| NUI Framework | SolidJS |
| NUI Styling | Tailwind CSS |
| Admin Panel | React + Vite |
| WebSocket | ws (Node.js) |
| Auth | JWT |
| Build | Turbo + esbuild |
| Package Manager | pnpm |
