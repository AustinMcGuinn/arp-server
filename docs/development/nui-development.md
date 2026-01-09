# NUI Development

This guide covers creating NUI (in-game browser) interfaces using SolidJS and the `@framework/ui` package.

## Overview

NUI allows you to create rich web-based interfaces inside FiveM using HTML, CSS, and JavaScript. This framework uses:

- **SolidJS** for reactive UI
- **Tailwind CSS** for styling
- **Vite** for building
- **@framework/ui** for components

## NUI Resource Structure

```
my-resource/
├── fxmanifest.lua
├── package.json
├── tsconfig.json
├── src/
│   ├── client/
│   │   └── index.ts      # Client script (opens NUI)
│   └── server/
│       └── index.ts
└── nui/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── index.tsx
        ├── index.css
        └── App.tsx
```

## Step 1: Update fxmanifest.lua

```lua
fx_version 'cerulean'
game 'gta5'

name 'my-nui-resource'
description 'Resource with NUI'
author 'Your Name'
version '1.0.0'

client_scripts {
    'dist/client/*.js',
}

server_scripts {
    'dist/server/*.js',
}

-- NUI configuration
ui_page 'nui/dist/index.html'

files {
    'nui/dist/**/*',
}
```

## Step 2: Create NUI Folder

```bash
mkdir -p nui/src
cd nui
```

### nui/package.json

```json
{
  "name": "my-resource-nui",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@framework/types": "workspace:*",
    "@framework/ui": "workspace:*",
    "solid-js": "^1.8.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vite-plugin-solid": "^2.8.0"
  }
}
```

### nui/vite.config.ts

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
```

### nui/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### nui/postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### nui/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "noEmit": true
  },
  "include": ["src"]
}
```

### nui/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My NUI</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>
</html>
```

### nui/src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  background: transparent;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

#root {
  width: 100vw;
  height: 100vh;
}
```

### nui/src/index.tsx

```tsx
import { render } from "solid-js/web";
import App from "./App";
import "./index.css";

render(() => <App />, document.getElementById("root")!);
```

## Step 3: Create App Component

### nui/src/App.tsx

```tsx
import { createSignal, Show } from "solid-js";
import { useNui, useNuiEvent, useKeyPress, Card, Button } from "@framework/ui";

function App() {
  const [visible, setVisible] = createSignal(false);
  const [data, setData] = createSignal<any>(null);
  const { fetchNui, closeNui } = useNui();

  // Listen for visibility toggle
  useNuiEvent("setVisible", (payload: { visible: boolean }) => {
    setVisible(payload.visible);
  });

  // Listen for data from client
  useNuiEvent("setData", (payload: any) => {
    setData(payload);
  });

  // Close on Escape
  useKeyPress("Escape", () => {
    if (visible()) {
      handleClose();
    }
  });

  const handleClose = () => {
    setVisible(false);
    closeNui();
  };

  const handleAction = async () => {
    const result = await fetchNui("doAction", { 
      someData: "value" 
    });
    
    if (result.success) {
      handleClose();
    }
  };

  return (
    <Show when={visible()}>
      <div class="flex items-center justify-center min-h-screen p-4">
        <Card variant="glass" class="w-full max-w-md p-6">
          <h1 class="text-2xl font-bold text-white mb-4">
            My NUI Interface
          </h1>
          
          <Show when={data()}>
            <p class="text-slate-300 mb-4">
              Data: {JSON.stringify(data())}
            </p>
          </Show>
          
          <div class="flex gap-2 justify-end">
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleAction}>
              Do Action
            </Button>
          </div>
        </Card>
      </div>
    </Show>
  );
}

export default App;
```

## Step 4: Client Script

### src/client/index.ts

```typescript
const RESOURCE_NAME = GetCurrentResourceName();

let isOpen = false;

// Open NUI
function openNui(data?: any): void {
  if (isOpen) return;
  
  isOpen = true;
  
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: "setVisible",
    data: { visible: true },
  });
  
  if (data) {
    SendNUIMessage({
      action: "setData",
      data,
    });
  }
}

// Close NUI
function closeNui(): void {
  if (!isOpen) return;
  
  isOpen = false;
  
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: "setVisible",
    data: { visible: false },
  });
}

// Command to open
RegisterCommand("openui", () => {
  openNui({ message: "Hello from client!" });
}, false);

// Register NUI callbacks
RegisterNuiCallbackType("doAction");
on("__cfx_nui:doAction", (data: any, cb: (result: any) => void) => {
  console.log("Action received:", data);
  
  // Do something
  emitNet("my-resource:action", data);
  
  cb({ success: true });
});

RegisterNuiCallbackType("closeNui");
on("__cfx_nui:closeNui", (_data: any, cb: (result: any) => void) => {
  closeNui();
  cb({ success: true });
});

// Server triggers
onNet("my-resource:openNui", (data: any) => {
  openNui(data);
});

onNet("my-resource:closeNui", () => {
  closeNui();
});

console.log(`[${RESOURCE_NAME}] Client loaded!`);
```

## Step 5: Build NUI

```bash
# Build NUI
cd nui
pnpm install
pnpm build

# Build resource scripts
cd ..
pnpm build
```

## Using @framework/ui

### Available Components

```tsx
import {
  Button,     // Styled buttons
  Input,      // Text inputs with labels
  Card,       // Container cards
  Modal,      // Dialog overlays
  Notification,
  Slider,
  Tooltip,
} from "@framework/ui";
```

### Available Hooks

```tsx
import {
  useNui,       // NUI callbacks
  useNuiEvent,  // Listen for messages
  useKeyPress,  // Keyboard events
} from "@framework/ui";
```

### useNui Hook

```tsx
const { fetchNui, closeNui } = useNui();

// Make callback to client
const result = await fetchNui<ResponseType>("callbackName", {
  param1: "value",
  param2: 123,
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// Close the NUI (calls closeNui callback)
closeNui();
```

### useNuiEvent Hook

```tsx
// Listen for messages from client
useNuiEvent<{ items: Item[] }>("setInventory", (data) => {
  setItems(data.items);
});

useNuiEvent<{ visible: boolean }>("setVisible", (data) => {
  setVisible(data.visible);
});
```

### useKeyPress Hook

```tsx
// Handle key presses
useKeyPress("Escape", () => {
  closeNui();
});

useKeyPress("Tab", () => {
  switchTab();
}, { preventDefault: true });
```

## NUI Message Protocol

### Client to NUI

```typescript
// Send message to NUI
SendNUIMessage({
  action: "eventName",
  data: { /* payload */ },
});
```

### NUI to Client (Callbacks)

```typescript
// In NUI
await fetchNui("callbackName", { data: "value" });

// In client
RegisterNuiCallbackType("callbackName");
on("__cfx_nui:callbackName", (data: any, cb: (result: any) => void) => {
  // Process data
  cb({ success: true, data: result });
});
```

## Styling Tips

### Transparent Background

```css
body {
  background: transparent;
}
```

### Glass Effect

```tsx
<Card variant="glass" class="backdrop-blur-lg">
  {/* Content */}
</Card>
```

### Animations

```css
/* Fade in */
.fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

## Development Mode

For faster development, run NUI separately:

1. Start Vite dev server:

```bash
cd nui
pnpm dev
```

2. Open browser to `http://localhost:5173`

3. Mock NUI messages in browser console:

```javascript
// Simulate client message
window.postMessage({
  action: "setVisible",
  data: { visible: true }
});

// Mock fetchNui responses
window.fetchNui = (event, data) => {
  console.log("fetchNui:", event, data);
  return Promise.resolve({ success: true, data: {} });
};
```

## Best Practices

1. **Always handle visibility** - Hide NUI when not in use
2. **Handle Escape key** - Let players close UI easily
3. **Validate callback responses** - Check `success` before using data
4. **Use loading states** - Show feedback during async operations
5. **Keep focus states** - Use `SetNuiFocus(true, true)` for input
6. **Release focus** - Always release when closing
7. **Responsive design** - Test at different resolutions

## Common Patterns

### Loading State

```tsx
const [loading, setLoading] = createSignal(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    const result = await fetchNui("submit", formData());
    if (result.success) {
      closeNui();
    }
  } finally {
    setLoading(false);
  }
};

<Button loading={loading()} onClick={handleSubmit}>
  Submit
</Button>
```

### Form Handling

```tsx
const [form, setForm] = createStore({
  name: "",
  email: "",
});

const updateField = (field: string, value: string) => {
  setForm(field, value);
};

<Input
  label="Name"
  value={form.name}
  onInput={(e) => updateField("name", e.currentTarget.value)}
/>
```

### List with Selection

```tsx
const [items, setItems] = createSignal<Item[]>([]);
const [selected, setSelected] = createSignal<number | null>(null);

<For each={items()}>
  {(item, index) => (
    <Card
      class={cn(
        "cursor-pointer transition",
        selected() === index() && "ring-2 ring-emerald-500"
      )}
      onClick={() => setSelected(index())}
    >
      {item.name}
    </Card>
  )}
</For>
```
