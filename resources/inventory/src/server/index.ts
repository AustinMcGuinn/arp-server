import type { InventoryItem, MoveItemInput } from "@framework/types";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Inventory System...`);

// Get config items
function getItemDefinition(name: string): any {
  return (globalThis as any).Config?.Items?.[name];
}

function getMaxWeight(): number {
  return (globalThis as any).Config?.MaxWeight ?? 100000;
}

function getMaxSlots(): number {
  return (globalThis as any).Config?.MaxSlots ?? 40;
}

// Database helpers
async function getOrCreateInventory(type: string, id: string): Promise<any> {
  return exports["[database]"].getOrCreateInventory(type, id, getMaxWeight());
}

async function updateInventoryItems(type: string, id: string, items: any[]): Promise<void> {
  return exports["[database]"].updateInventoryItems(type, id, items);
}

// Core helpers
function getCharacter(source: number): any {
  return exports["[core]"].getCharacter(source);
}

// In-memory cache for loaded inventories
const inventoryCache: Map<string, { items: InventoryItem[]; lastUpdate: number }> = new Map();

function getCacheKey(type: string, id: string): string {
  return `${type}:${id}`;
}

// Get inventory
async function getInventory(type: string, id: string): Promise<InventoryItem[]> {
  const cacheKey = getCacheKey(type, id);
  const cached = inventoryCache.get(cacheKey);

  if (cached && Date.now() - cached.lastUpdate < 5000) {
    return cached.items;
  }

  const inventory = await getOrCreateInventory(type, id);
  const items = inventory.items as InventoryItem[];

  inventoryCache.set(cacheKey, { items, lastUpdate: Date.now() });
  return items;
}

// Save inventory
async function saveInventory(type: string, id: string, items: InventoryItem[]): Promise<void> {
  const cacheKey = getCacheKey(type, id);
  inventoryCache.set(cacheKey, { items, lastUpdate: Date.now() });
  await updateInventoryItems(type, id, items);
}

// Calculate inventory weight
function calculateWeight(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + item.weight * item.count, 0);
}

// Find item in inventory
function findItem(items: InventoryItem[], name: string, slot?: number): InventoryItem | undefined {
  if (slot !== undefined) {
    return items.find((item) => item.slot === slot && item.name === name);
  }
  return items.find((item) => item.name === name);
}

// Add item to inventory
async function addItem(
  type: string,
  id: string,
  name: string,
  count: number,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const definition = getItemDefinition(name);
  if (!definition) {
    console.error(`[${RESOURCE_NAME}] Item not found: ${name}`);
    return false;
  }

  const items = await getInventory(type, id);
  const totalWeight = calculateWeight(items);
  const itemWeight = definition.weight * count;

  if (totalWeight + itemWeight > getMaxWeight()) {
    return false;
  }

  // Try to stack
  if (definition.stackable) {
    const existing = items.find((item) => item.name === name && item.count < definition.maxStack);
    if (existing) {
      const canAdd = Math.min(count, definition.maxStack - existing.count);
      existing.count += canAdd;
      count -= canAdd;
    }
  }

  // Create new slots for remaining
  while (count > 0) {
    const freeSlot = findFreeSlot(items);
    if (freeSlot === null) return false;

    const addCount = definition.stackable ? Math.min(count, definition.maxStack) : 1;
    items.push({
      slot: freeSlot,
      name,
      label: definition.label,
      count: addCount,
      weight: definition.weight,
      metadata: metadata ?? {},
      image: definition.image,
    });
    count -= addCount;
  }

  await saveInventory(type, id, items);
  return true;
}

// Remove item from inventory
async function removeItem(
  type: string,
  id: string,
  name: string,
  count: number,
  slot?: number
): Promise<boolean> {
  const items = await getInventory(type, id);
  let remaining = count;

  const targetItems = slot !== undefined
    ? items.filter((item) => item.slot === slot && item.name === name)
    : items.filter((item) => item.name === name);

  for (const item of targetItems) {
    if (remaining <= 0) break;

    if (item.count <= remaining) {
      remaining -= item.count;
      const index = items.indexOf(item);
      items.splice(index, 1);
    } else {
      item.count -= remaining;
      remaining = 0;
    }
  }

  if (remaining > 0) return false;

  await saveInventory(type, id, items);
  return true;
}

// Find free slot
function findFreeSlot(items: InventoryItem[]): number | null {
  const usedSlots = new Set(items.map((item) => item.slot));
  for (let i = 1; i <= getMaxSlots(); i++) {
    if (!usedSlots.has(i)) return i;
  }
  return null;
}

// Move item between inventories
async function moveItem(data: MoveItemInput): Promise<boolean> {
  const fromItems = await getInventory(
    data.fromInventory.split(":")[0],
    data.fromInventory.split(":")[1]
  );
  const toItems =
    data.fromInventory === data.toInventory
      ? fromItems
      : await getInventory(data.toInventory.split(":")[0], data.toInventory.split(":")[1]);

  const fromItem = fromItems.find((item) => item.slot === data.fromSlot);
  if (!fromItem || fromItem.count < data.count) return false;

  const toItem = toItems.find((item) => item.slot === data.toSlot);

  // Moving to empty slot
  if (!toItem) {
    if (fromItem.count === data.count) {
      fromItem.slot = data.toSlot;
      if (data.fromInventory !== data.toInventory) {
        const index = fromItems.indexOf(fromItem);
        fromItems.splice(index, 1);
        toItems.push(fromItem);
      }
    } else {
      fromItem.count -= data.count;
      const newItem = { ...fromItem, slot: data.toSlot, count: data.count };
      toItems.push(newItem);
    }
  }
  // Swapping or stacking
  else if (toItem.name === fromItem.name && getItemDefinition(toItem.name)?.stackable) {
    const maxStack = getItemDefinition(toItem.name).maxStack;
    const canAdd = Math.min(data.count, maxStack - toItem.count);
    toItem.count += canAdd;
    fromItem.count -= canAdd;
    if (fromItem.count <= 0) {
      const index = fromItems.indexOf(fromItem);
      fromItems.splice(index, 1);
    }
  } else {
    // Swap
    const tempSlot = fromItem.slot;
    fromItem.slot = toItem.slot;
    toItem.slot = tempSlot;
  }

  await saveInventory(
    data.fromInventory.split(":")[0],
    data.fromInventory.split(":")[1],
    fromItems
  );

  if (data.fromInventory !== data.toInventory) {
    await saveInventory(data.toInventory.split(":")[0], data.toInventory.split(":")[1], toItems);
  }

  return true;
}

// Net events
onNet("inventory:open", async () => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);

  if (!character) return;

  const items = await getInventory("player", String(character.id));

  emitNet("inventory:openNui", source, {
    primary: {
      id: `player:${character.id}`,
      type: "player",
      label: "Inventory",
      slots: getMaxSlots(),
      maxWeight: getMaxWeight(),
      items,
    },
  });
});

onNet("inventory:moveItem", async (data: MoveItemInput) => {
  const source = (globalThis as any).source as number;
  const success = await moveItem(data);

  if (success) {
    emitNet("inventory:refresh", source);
  } else {
    emitNet("framework:showNotification", source, "error", "Error", "Cannot move item");
  }
});

onNet("inventory:useItem", async (slot: number) => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);

  if (!character) return;

  const items = await getInventory("player", String(character.id));
  const item = items.find((i) => i.slot === slot);

  if (!item) return;

  const definition = getItemDefinition(item.name);
  if (!definition?.usable) return;

  // Emit use event for other resources to handle
  emit("inventory:itemUsed", source, item);

  // Remove consumable items
  if (definition.category === "food" || definition.category === "drink" || definition.category === "medical") {
    await removeItem("player", String(character.id), item.name, 1, slot);
    emitNet("inventory:refresh", source);
  }
});

onNet("inventory:close", () => {
  const source = (globalThis as any).source as number;
  emitNet("inventory:closeNui", source);
});

// Exports
exports("addItem", (source: number, name: string, count: number, metadata?: Record<string, unknown>) => {
  const character = getCharacter(source);
  if (!character) return false;
  return addItem("player", String(character.id), name, count, metadata);
});

exports("removeItem", (source: number, name: string, count: number, slot?: number) => {
  const character = getCharacter(source);
  if (!character) return false;
  return removeItem("player", String(character.id), name, count, slot);
});

exports("hasItem", async (source: number, name: string, count: number = 1) => {
  const character = getCharacter(source);
  if (!character) return false;

  const items = await getInventory("player", String(character.id));
  const total = items
    .filter((item) => item.name === name)
    .reduce((sum, item) => sum + item.count, 0);

  return total >= count;
});

exports("getItem", (name: string) => getItemDefinition(name));

console.log(`[${RESOURCE_NAME}] Inventory System loaded!`);
