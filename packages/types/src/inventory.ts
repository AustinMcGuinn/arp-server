import { z } from "zod";

export const ItemMetadataSchema = z.record(z.string(), z.unknown());

export type ItemMetadata = z.infer<typeof ItemMetadataSchema>;

export interface ItemDefinition {
    name: string;
    label: string;
    description: string;
    weight: number;
    stackable: boolean;
    maxStack: number;
    usable: boolean;
    unique: boolean;
    image: string;
    category: ItemCategory;
}

export type ItemCategory =
    | "weapon"
    | "ammo"
    | "food"
    | "drink"
    | "medical"
    | "crafting"
    | "clothing"
    | "misc";

export interface InventoryItem {
    slot: number;
    name: string;
    label: string;
    count: number;
    weight: number;
    metadata: ItemMetadata;
    image: string;
}

export type InventoryType =
    | "player"
    | "vehicle"
    | "stash"
    | "glovebox"
    | "trunk"
    | "drop"
    | "shop";

export interface Inventory {
    id: string;
    type: InventoryType;
    label: string;
    slots: number;
    maxWeight: number;
    items: InventoryItem[];
}

export const MoveItemSchema = z.object({
    fromInventory: z.string(),
    toInventory: z.string(),
    fromSlot: z.number().int().positive(),
    toSlot: z.number().int().positive(),
    count: z.number().int().positive(),
});

export type MoveItemInput = z.infer<typeof MoveItemSchema>;

export const UseItemSchema = z.object({
    slot: z.number().int().positive(),
});

export type UseItemInput = z.infer<typeof UseItemSchema>;
