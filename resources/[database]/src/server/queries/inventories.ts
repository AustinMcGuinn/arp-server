import { eq, and } from "drizzle-orm";
import { db } from "../connection";
import { inventories, type Inventory, type NewInventory } from "../schema";

/**
 * Get inventory by type and ID
 */
export async function getInventory(
  inventoryType: string,
  inventoryId: string
): Promise<Inventory | undefined> {
  return db.query.inventories.findFirst({
    where: and(
      eq(inventories.inventoryType, inventoryType),
      eq(inventories.inventoryId, inventoryId)
    ),
  });
}

/**
 * Create or get inventory
 */
export async function getOrCreateInventory(
  inventoryType: string,
  inventoryId: string,
  maxWeight: number = 100000
): Promise<Inventory> {
  let inventory = await getInventory(inventoryType, inventoryId);

  if (!inventory) {
    const result = await db.insert(inventories).values({
      inventoryType,
      inventoryId,
      items: [],
      maxWeight,
    });

    inventory = {
      id: Number(result.insertId),
      inventoryType,
      inventoryId,
      items: [],
      maxWeight,
    };
  }

  return inventory;
}

/**
 * Update inventory items
 */
export async function updateInventoryItems(
  inventoryType: string,
  inventoryId: string,
  items: unknown[]
): Promise<void> {
  await db
    .update(inventories)
    .set({ items })
    .where(
      and(
        eq(inventories.inventoryType, inventoryType),
        eq(inventories.inventoryId, inventoryId)
      )
    );
}

/**
 * Delete inventory
 */
export async function deleteInventory(
  inventoryType: string,
  inventoryId: string
): Promise<void> {
  await db
    .delete(inventories)
    .where(
      and(
        eq(inventories.inventoryType, inventoryType),
        eq(inventories.inventoryId, inventoryId)
      )
    );
}

/**
 * Get player inventory (shorthand)
 */
export async function getPlayerInventory(
  characterId: number
): Promise<Inventory | undefined> {
  return getInventory("player", String(characterId));
}

/**
 * Update max weight
 */
export async function updateMaxWeight(
  inventoryType: string,
  inventoryId: string,
  maxWeight: number
): Promise<void> {
  await db
    .update(inventories)
    .set({ maxWeight })
    .where(
      and(
        eq(inventories.inventoryType, inventoryType),
        eq(inventories.inventoryId, inventoryId)
      )
    );
}
