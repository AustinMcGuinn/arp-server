# @framework/ui

The UI package provides SolidJS components and hooks for building NUI (in-game browser) interfaces.

## Installation

This package is internal to the monorepo. Import in NUI applications:

```typescript
import { Button, Card, useNui, useNuiEvent } from "@framework/ui";
```

## Components

### Button

A styled button with variants and loading state.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "danger" \| "ghost" \| "outline"` | `"primary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |

**Example:**

```tsx
import { Button } from "@framework/ui";

function MyComponent() {
  const [loading, setLoading] = createSignal(false);

  return (
    <div>
      <Button variant="primary" onClick={handleSubmit}>
        Submit
      </Button>
      
      <Button variant="danger" size="sm">
        Delete
      </Button>
      
      <Button variant="ghost" loading={loading()}>
        Loading...
      </Button>
      
      <Button variant="outline" disabled>
        Disabled
      </Button>
    </div>
  );
}
```

### Input

A styled text input with label and error states.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above input |
| `error` | `string` | - | Error message below input |
| `...` | `InputHTMLAttributes` | - | All standard input props |

**Example:**

```tsx
import { Input } from "@framework/ui";

function MyForm() {
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal("");

  return (
    <Input
      label="Character Name"
      placeholder="Enter name..."
      value={name()}
      onInput={(e) => setName(e.currentTarget.value)}
      error={error()}
    />
  );
}
```

### Card

A container component with glass/solid variants.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "glass" \| "solid"` | `"default"` | Card style |
| `class` | `string` | - | Additional CSS classes |

**Example:**

```tsx
import { Card } from "@framework/ui";

function CharacterCard() {
  return (
    <Card variant="glass" class="p-6">
      <h2 class="text-xl font-bold">John Doe</h2>
      <p class="text-slate-400">Police Officer</p>
    </Card>
  );
}
```

### Modal

A dialog overlay with backdrop and escape key handling.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether modal is visible |
| `onClose` | `() => void` | - | Called when modal should close |
| `title` | `string` | - | Optional header title |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Modal width |

**Example:**

```tsx
import { Modal, Button } from "@framework/ui";

function ConfirmDialog() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal
        open={open()}
        onClose={() => setOpen(false)}
        title="Confirm Action"
        size="sm"
      >
        <p class="text-slate-300 mb-4">
          Are you sure you want to proceed?
        </p>
        <div class="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

### Notification

A toast notification component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"success" \| "error" \| "info" \| "warning"` | - | Notification style |
| `title` | `string` | - | Notification title |
| `message` | `string` | - | Notification message |
| `onClose` | `() => void` | - | Called when dismissed |

**Example:**

```tsx
import { Notification } from "@framework/ui";

function NotificationExample() {
  return (
    <Notification
      type="success"
      title="Character Created"
      message="Your character has been saved successfully."
      onClose={() => removeNotification()}
    />
  );
}
```

### Slider

A range slider input.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Current value |
| `onChange` | `(value: number) => void` | - | Called when value changes |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `label` | `string` | - | Label text |

**Example:**

```tsx
import { Slider } from "@framework/ui";

function AppearanceSlider() {
  const [noseWidth, setNoseWidth] = createSignal(0);

  return (
    <Slider
      label="Nose Width"
      value={noseWidth()}
      onChange={setNoseWidth}
      min={-1}
      max={1}
      step={0.1}
    />
  );
}
```

### Tooltip

A hover tooltip component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| JSX.Element` | - | Tooltip content |
| `position` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Tooltip position |
| `children` | `JSX.Element` | - | Trigger element |

**Example:**

```tsx
import { Tooltip, Button } from "@framework/ui";

function TooltipExample() {
  return (
    <Tooltip content="Delete this character permanently">
      <Button variant="danger" size="icon">
        🗑️
      </Button>
    </Tooltip>
  );
}
```

## Hooks

### useNui

Hook for making NUI callbacks to the FiveM client.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `fetchNui` | `(event: string, data?: object) => Promise<NuiResponse>` | Make a callback |
| `closeNui` | `() => void` | Close the NUI frame |

**Example:**

```tsx
import { useNui } from "@framework/ui";

function CharacterSelect() {
  const { fetchNui, closeNui } = useNui();

  const selectCharacter = async (id: number) => {
    const response = await fetchNui("selectCharacter", { characterId: id });
    
    if (response.success) {
      closeNui();
    } else {
      console.error(response.error);
    }
  };

  return (
    <Button onClick={() => selectCharacter(1)}>
      Select Character
    </Button>
  );
}
```

### useNuiEvent

Hook for listening to NUI messages from the client.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | `string` | Event action to listen for |
| `handler` | `(data: T) => void` | Callback when event received |

**Example:**

```tsx
import { useNuiEvent } from "@framework/ui";
import type { CharacterSelectData } from "@framework/types";

function CharacterSelect() {
  const [characters, setCharacters] = createSignal([]);

  // Listen for character data from client
  useNuiEvent<CharacterSelectData>("setCharacters", (data) => {
    setCharacters(data.characters);
  });

  // Listen for visibility changes
  useNuiEvent<{ visible: boolean }>("setVisible", (data) => {
    setVisible(data.visible);
  });

  return (
    <For each={characters()}>
      {(char) => <CharacterCard character={char} />}
    </For>
  );
}
```

### useKeyPress

Hook for handling keyboard events.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Key to listen for (case-insensitive) |
| `handler` | `() => void` | Callback when key pressed |
| `options.preventDefault` | `boolean` | Prevent default behavior |

**Example:**

```tsx
import { useKeyPress, useNui } from "@framework/ui";

function InventoryUI() {
  const { closeNui } = useNui();

  // Close on Escape key
  useKeyPress("Escape", () => {
    closeNui();
  });

  // Use item on Enter
  useKeyPress("Enter", () => {
    useSelectedItem();
  }, { preventDefault: true });

  return <div>...</div>;
}
```

## Utility Functions

### cn

Utility for conditionally joining class names (wraps clsx + tailwind-merge).

```typescript
import { cn } from "@framework/ui";

<div class={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" ? "bg-blue-500" : "bg-gray-500"
)} />
```

## Styling

The UI package uses Tailwind CSS. Import the base styles in your NUI app:

```css
/* src/index.css */
@import "@framework/ui/styles";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Complete Example

```tsx
import { createSignal, For, Show } from "solid-js";
import { 
  Button, 
  Card, 
  Modal, 
  Input, 
  useNui, 
  useNuiEvent, 
  useKeyPress 
} from "@framework/ui";

function CharacterSelection() {
  const [characters, setCharacters] = createSignal([]);
  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const [showDelete, setShowDelete] = createSignal(false);
  const { fetchNui, closeNui } = useNui();

  // Listen for data from client
  useNuiEvent("setCharacters", setCharacters);

  // Close on Escape
  useKeyPress("Escape", closeNui);

  const handleSelect = async () => {
    const id = selectedId();
    if (!id) return;

    const result = await fetchNui("selectCharacter", { id });
    if (result.success) {
      closeNui();
    }
  };

  const handleDelete = async () => {
    const id = selectedId();
    if (!id) return;

    await fetchNui("deleteCharacter", { id });
    setShowDelete(false);
  };

  return (
    <div class="min-h-screen flex items-center justify-center p-8">
      <Card variant="glass" class="w-full max-w-4xl p-6">
        <h1 class="text-2xl font-bold text-white mb-6">
          Select Character
        </h1>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <For each={characters()}>
            {(char) => (
              <Card
                variant={selectedId() === char.id ? "solid" : "default"}
                class="cursor-pointer"
                onClick={() => setSelectedId(char.id)}
              >
                <h3 class="font-semibold">{char.firstName} {char.lastName}</h3>
                <p class="text-sm text-slate-400">{char.job}</p>
              </Card>
            )}
          </For>
        </div>

        <div class="flex gap-2 justify-end">
          <Button variant="ghost" onClick={closeNui}>
            Disconnect
          </Button>
          <Show when={selectedId()}>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          </Show>
          <Button onClick={handleSelect} disabled={!selectedId()}>
            Play
          </Button>
        </div>
      </Card>

      <Modal
        open={showDelete()}
        onClose={() => setShowDelete(false)}
        title="Delete Character"
        size="sm"
      >
        <p class="text-slate-300 mb-4">
          This action cannot be undone.
        </p>
        <div class="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Forever
          </Button>
        </div>
      </Modal>
    </div>
  );
}
```
