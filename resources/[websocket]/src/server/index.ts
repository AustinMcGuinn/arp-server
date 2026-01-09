import { WebSocketManager } from "./websocket";
import { registerHandlers } from "./handlers";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting WebSocket Server...`);

// Configuration
const WS_PORT = parseInt(GetConvar("ws_port", "3001"));
const WS_SECRET = GetConvar("ws_jwt_secret", "change-this-secret");

if (WS_SECRET === "change-this-secret") {
  console.warn(`[${RESOURCE_NAME}] WARNING: Using default JWT secret. Set ws_jwt_secret convar!`);
}

// Create WebSocket manager
export const wsManager = new WebSocketManager(WS_PORT, WS_SECRET);

// Start server
wsManager.start();

// Register message handlers
registerHandlers(wsManager);

// Cleanup on resource stop
on("onResourceStop", (resourceName: string) => {
  if (resourceName === RESOURCE_NAME) {
    wsManager.stop();
  }
});

// Exports
exports("broadcast", (event: string, data: unknown) => wsManager.broadcast(event, data));
exports("sendToClient", (clientId: string, event: string, data: unknown) => 
  wsManager.sendToClient(clientId, event, data)
);
exports("getConnectedClients", () => wsManager.getConnectedClients());

console.log(`[${RESOURCE_NAME}] WebSocket Server loaded on port ${WS_PORT}!`);
