// Server Events
export const ServerEvents = {
    // Core
    PLAYER_LOADED: "framework:playerLoaded",
    PLAYER_DROPPED: "framework:playerDropped",

    // Character
    CHARACTER_SELECTED: "framework:characterSelected",
    CHARACTER_CREATED: "framework:characterCreated",
    CHARACTER_DELETED: "framework:characterDeleted",

    // Inventory
    INVENTORY_UPDATED: "framework:inventoryUpdated",
    ITEM_USED: "framework:itemUsed",
    ITEM_ADDED: "framework:itemAdded",
    ITEM_REMOVED: "framework:itemRemoved",

    // Job
    JOB_UPDATED: "framework:jobUpdated",
    DUTY_CHANGED: "framework:dutyChanged",

    // Vehicle
    VEHICLE_SPAWNED: "framework:vehicleSpawned",
    VEHICLE_STORED: "framework:vehicleStored",
} as const;

// Client Events
export const ClientEvents = {
    // NUI
    OPEN_CHARACTER_SELECT: "framework:openCharacterSelect",
    OPEN_CHARACTER_CREATE: "framework:openCharacterCreate",
    OPEN_INVENTORY: "framework:openInventory",
    CLOSE_NUI: "framework:closeNui",

    // Notifications
    SHOW_NOTIFICATION: "framework:showNotification",

    // Character
    SPAWN_CHARACTER: "framework:spawnCharacter",

    // Inventory
    REFRESH_INVENTORY: "framework:refreshInventory",

    // Vehicle
    VEHICLE_KEYS: "framework:vehicleKeys",
} as const;

// NUI Callbacks
export const NuiCallbacks = {
    // Character Selection
    GET_CHARACTERS: "getCharacters",
    SELECT_CHARACTER: "selectCharacter",
    DELETE_CHARACTER: "deleteCharacter",
    CREATE_NEW_CHARACTER: "createNewCharacter",

    // Character Creation
    SAVE_CHARACTER: "saveCharacter",
    CANCEL_CHARACTER: "cancelCharacter",
    UPDATE_APPEARANCE: "updateAppearance",

    // Inventory
    MOVE_ITEM: "moveItem",
    USE_ITEM: "useItem",
    DROP_ITEM: "dropItem",
    CLOSE_INVENTORY: "closeInventory",
} as const;

export type ServerEventName = typeof ServerEvents[keyof typeof ServerEvents];
export type ClientEventName = typeof ClientEvents[keyof typeof ClientEvents];
export type NuiCallbackName = typeof NuiCallbacks[keyof typeof NuiCallbacks];
