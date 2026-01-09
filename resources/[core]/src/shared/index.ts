// Shared types and constants for Core resource

export const RESOURCE_NAME = GetCurrentResourceName();

export interface CoreConfig {
  serverName: string;
  maxCharacters: number;
  defaultSpawn: { x: number; y: number; z: number; heading: number };
  startingCash: number;
  startingBank: number;
  permissionLevels: Record<string, number>;
}

// Read config from Lua
declare const Config: CoreConfig;

export function getConfig(): CoreConfig {
  return {
    serverName: (globalThis as any).Config?.ServerName ?? "FiveM Server",
    maxCharacters: (globalThis as any).Config?.MaxCharacters ?? 5,
    defaultSpawn: {
      x: -269.4,
      y: -955.3,
      z: 31.2,
      heading: 205.0,
    },
    startingCash: (globalThis as any).Config?.StartingCash ?? 500,
    startingBank: (globalThis as any).Config?.StartingBank ?? 5000,
    permissionLevels: (globalThis as any).Config?.PermissionLevels ?? {
      user: 0,
      moderator: 1,
      admin: 2,
      superadmin: 3,
      owner: 4,
    },
  };
}
