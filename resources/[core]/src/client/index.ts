import { NotificationManager } from "./notifications";
import { NuiManager } from "./nui";
import { SpawnManager } from "./spawn";
import { RESOURCE_NAME } from "../shared";

console.log(`[${RESOURCE_NAME}] Starting Core Framework (Client)...`);

// Initialize managers
export const notificationManager = new NotificationManager();
export const nuiManager = new NuiManager();
export const spawnManager = new SpawnManager();

// Wait for player to fully spawn
on("playerSpawned", () => {
  console.log(`[${RESOURCE_NAME}] Player spawned`);
});

// Handle character selection trigger
onNet("framework:openCharacterSelect", () => {
  // Hide HUD elements
  DisplayRadar(false);
  
  // Send message to character selection NUI
  SendNUIMessage({
    action: "openCharacterSelect",
    data: {},
  });
});

// Handle money updates
onNet("framework:updateMoney", (type: "cash" | "bank", amount: number) => {
  SendNUIMessage({
    action: "updateMoney",
    data: { type, amount },
  });
});

// Show notification from server
onNet("framework:showNotification", (type: string, title: string, message: string, duration?: number) => {
  notificationManager.show(type as any, title, message, duration);
});

// NUI Callbacks
RegisterNuiCallbackType("closeNui");
on("__cfx_nui:closeNui", (_data: unknown, cb: (result: unknown) => void) => {
  SetNuiFocus(false, false);
  cb({ success: true });
});

console.log(`[${RESOURCE_NAME}] Core Framework (Client) loaded successfully!`);
