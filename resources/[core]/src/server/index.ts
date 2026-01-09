import { PlayerManager } from "./player";
import { EventManager } from "./events";
import { PermissionManager } from "./permissions";
import { registerExports } from "./exports";
import { RESOURCE_NAME } from "../shared";

console.log(`[${RESOURCE_NAME}] Starting Core Framework...`);

// Initialize managers
export const playerManager = new PlayerManager();
export const eventManager = new EventManager();
export const permissionManager = new PermissionManager();

// Register exports for other resources
registerExports();

// Player connection handler
on("playerConnecting", (name: string, setKickReason: (reason: string) => void, deferrals: any) => {
  const source = (globalThis as any).source as number;
  deferrals.defer();

  setTimeout(async () => {
    deferrals.update("Checking player...");

    try {
      await playerManager.handleConnecting(source, name, deferrals);
    } catch (error) {
      console.error(`[${RESOURCE_NAME}] Error during player connection:`, error);
      deferrals.done("An error occurred during connection. Please try again.");
    }
  }, 0);
});

// Player joined (fully spawned)
on("playerJoining", (oldId: string) => {
  const source = (globalThis as any).source as number;
  playerManager.handleJoining(source);
});

// Player dropped
on("playerDropped", (reason: string) => {
  const source = (globalThis as any).source as number;
  playerManager.handleDropped(source, reason);
});

// Resource stop cleanup
on("onResourceStop", (resourceName: string) => {
  if (resourceName === RESOURCE_NAME) {
    console.log(`[${RESOURCE_NAME}] Stopping Core Framework...`);
    playerManager.cleanup();
  }
});

console.log(`[${RESOURCE_NAME}] Core Framework loaded successfully!`);
