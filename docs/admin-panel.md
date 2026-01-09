# Admin Panel

The admin panel is a web-based dashboard for managing your FiveM server in real-time.

## Overview

Features:

- Real-time player monitoring
- Server statistics
- Player management (kick, ban)
- Job management
- Server announcements
- WebSocket-based live updates

## Technology Stack

- **Framework**: React (via SolidJS Router)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Communication**: WebSocket

## Setup

### Prerequisites

- Node.js >= 18.0.0
- FiveM server running with `[websocket]` resource
- Valid JWT token for authentication

### Installation

1. **Navigate to admin panel:**

```bash
cd apps/admin-panel
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Configure environment:**

Create `.env` file:

```env
VITE_WS_URL=ws://your-server-ip:3001
```

4. **Start development server:**

```bash
pnpm dev
```

5. **Build for production:**

```bash
pnpm build
```

The built files will be in `dist/` folder.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:3001` |

### Server-Side Token Generation

Generate admin tokens on the FiveM server:

```typescript
// In a server resource
RegisterCommand("generateadmintoken", (source: number) => {
  // Verify source is console or has permission
  if (source !== 0 && !exports["[core]"].isAdmin(source)) {
    return;
  }
  
  const token = exports["[websocket]"].generateToken(
    "admin",           // Subject
    ["admin"],         // Permissions (admin = all access)
    "7d"               // Expiration
  );
  
  console.log(`Admin Token: ${token}`);
}, true);
```

## Authentication

### Login Flow

1. User enters JWT token on login page
2. Token is stored in local storage
3. WebSocket connection is established
4. Token is sent via `auth` event
5. Server validates and grants permissions

### Token Storage

Tokens are stored in `authStore`:

```typescript
// lib/auth.ts
export const authStore = {
  token: localStorage.getItem("admin_token"),
};

export function setToken(token: string): void {
  localStorage.setItem("admin_token", token);
  authStore.token = token;
}

export function logout(): void {
  localStorage.removeItem("admin_token");
  authStore.token = null;
}
```

## Pages

### Dashboard

- Server statistics (players, uptime)
- Quick actions
- Recent activity

### Players

- Online player list
- Player details (character, job, money)
- Kick/ban actions

### Jobs

- View all jobs
- Employee counts
- Job management

### Settings

- Connection status
- Token management
- Configuration

## WebSocket Integration

### Connecting

```typescript
import { useWebSocket } from "./lib/websocket";

function MyComponent() {
  const { isConnected, connect, send, subscribe } = useWebSocket();
  
  // Subscribe to events
  createEffect(() => {
    const unsubscribe = subscribe("players", (data) => {
      setPlayers(data.players);
    });
    
    return unsubscribe;
  });
  
  // Send requests
  const refreshPlayers = () => {
    send("getPlayers", {});
  };
  
  return (
    <div>
      <span>Status: {isConnected() ? "Connected" : "Disconnected"}</span>
      <button onClick={refreshPlayers}>Refresh</button>
    </div>
  );
}
```

### Available Commands

| Command | Permission | Description |
|---------|------------|-------------|
| `getPlayers` | `players.view` | Get online players |
| `getStats` | `stats.view` | Get server statistics |
| `getJobs` | `jobs.view` | Get job definitions |
| `kickPlayer` | `players.kick` | Kick a player |
| `announce` | `announce` | Send server announcement |

### Receiving Events

```typescript
// Subscribe to real-time events
subscribe("playerJoined", (data) => {
  console.log(`${data.name} joined`);
});

subscribe("playerLeft", (data) => {
  console.log(`${data.name} left: ${data.reason}`);
});
```

## Components

### Sidebar

Navigation sidebar with links to all pages.

```typescript
// components/Sidebar.tsx
const navItems = [
  { href: "/", icon: HomeIcon, label: "Dashboard" },
  { href: "/players", icon: UsersIcon, label: "Players" },
  { href: "/jobs", icon: BriefcaseIcon, label: "Jobs" },
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
];
```

### Player Card

Displays player information with actions.

```typescript
<PlayerCard
  player={{
    source: 1,
    name: "Player Name",
    character: {
      name: "John Doe",
      job: "Police Officer",
      cash: 5000,
      bank: 25000
    }
  }}
  onKick={(source, reason) => kickPlayer(source, reason)}
/>
```

## Deployment

### Static Hosting

Build and deploy to any static hosting:

```bash
pnpm build
# Upload dist/ to your hosting
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name admin.yourserver.com;
    
    root /var/www/admin-panel/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Token Expiration**: Use short-lived tokens
3. **Permission Scoping**: Grant minimal necessary permissions
4. **IP Restrictions**: Consider firewall rules for WebSocket port
5. **CORS**: Configure CORS on WebSocket server if needed

## Customization

### Theming

Modify `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#your-color',
          600: '#your-darker-color',
        },
      },
    },
  },
};
```

### Adding Pages

1. Create component in `src/pages/`
2. Add route in `src/index.tsx`
3. Add navigation item in `Sidebar.tsx`

```typescript
// src/pages/MyPage.tsx
export default function MyPage() {
  return (
    <div>
      <h1 class="text-2xl font-bold text-white">My Page</h1>
      {/* Content */}
    </div>
  );
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to WebSocket | Check `VITE_WS_URL` and server firewall |
| Invalid token error | Generate a new token on the server |
| Page not loading | Ensure FiveM server is running |
| Real-time updates not working | Check WebSocket connection status |
