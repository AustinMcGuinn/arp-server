import type { WebSocketManager } from "./websocket";

// Core helpers
function getPlayers(): any[] {
  return exports["[core]"].getPlayers();
}

// Database helpers
async function getAllJobs(): Promise<any[]> {
  return exports["[database]"].getAllJobs();
}

async function getAllUsers(): Promise<any[]> {
  return exports["[database]"].getAllUsers();
}

export function registerHandlers(ws: WebSocketManager): void {
  // Get online players
  ws.on("getPlayers", (client, _data) => {
    if (!ws.hasPermission(client.id, "players.view")) {
      ws.sendToClient(client.id, "error", { message: "Permission denied" });
      return;
    }

    const players = getPlayers();
    const playerData = players.map((p) => ({
      source: p.source,
      name: p.name,
      identifiers: {
        license: p.identifiers.license,
        discord: p.identifiers.discord,
      },
      character: p.character
        ? {
            id: p.character.id,
            name: p.character.fullName,
            job: p.character.job.label,
            cash: p.character.cash,
            bank: p.character.bank,
          }
        : null,
    }));

    ws.sendToClient(client.id, "players", { players: playerData });
  });

  // Get server stats
  ws.on("getStats", (client, _data) => {
    if (!ws.hasPermission(client.id, "stats.view")) {
      ws.sendToClient(client.id, "error", { message: "Permission denied" });
      return;
    }

    const players = getPlayers();

    ws.sendToClient(client.id, "stats", {
      onlinePlayers: players.length,
      maxPlayers: GetConvarInt("sv_maxClients", 32),
      uptime: Math.floor(process.uptime()),
    });
  });

  // Get jobs
  ws.on("getJobs", async (client, _data) => {
    if (!ws.hasPermission(client.id, "jobs.view")) {
      ws.sendToClient(client.id, "error", { message: "Permission denied" });
      return;
    }

    const jobs = await getAllJobs();
    ws.sendToClient(client.id, "jobs", { jobs });
  });

  // Kick player
  ws.on("kickPlayer", (client, data: any) => {
    if (!ws.hasPermission(client.id, "players.kick")) {
      ws.sendToClient(client.id, "error", { message: "Permission denied" });
      return;
    }

    const { source, reason } = data;
    DropPlayer(String(source), reason || "Kicked by admin");

    ws.sendToClient(client.id, "success", { message: `Player ${source} kicked` });
    ws.broadcast("playerKicked", { source, reason });
  });

  // Send announcement
  ws.on("announce", (client, data: any) => {
    if (!ws.hasPermission(client.id, "announce")) {
      ws.sendToClient(client.id, "error", { message: "Permission denied" });
      return;
    }

    const { message, type } = data;
    emitNet("framework:showNotification", -1, type || "info", "Announcement", message);

    ws.sendToClient(client.id, "success", { message: "Announcement sent" });
  });

  // Subscribe to events
  ws.on("subscribe", (client, data: any) => {
    // Would implement event subscription system here
    ws.sendToClient(client.id, "subscribed", { events: data.events || [] });
  });

  // Forward game events to WebSocket clients
  on("framework:playerLoaded", (source: number, player: any) => {
    ws.broadcast("playerJoined", {
      source,
      name: player.name,
      license: player.identifiers.license,
    });
  });

  on("framework:playerDropped", (source: number, player: any, reason: string) => {
    ws.broadcast("playerLeft", {
      source,
      name: player.name,
      reason,
    });
  });

  on("framework:characterSelected", (source: number, character: any) => {
    ws.broadcast("characterSelected", {
      source,
      characterId: character.id,
      name: character.fullName,
    });
  });
}
