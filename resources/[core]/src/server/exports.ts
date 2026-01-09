import { playerManager, permissionManager } from "./index";
import type { FrameworkPlayer, PlayerCharacter } from "@framework/types";

/**
 * Register all exports for other resources to use
 */
export function registerExports(): void {
  // Player exports
  exports("getPlayer", (source: number): FrameworkPlayer | undefined => {
    return playerManager.getPlayer(source);
  });

  exports("getPlayers", (): FrameworkPlayer[] => {
    return playerManager.getPlayers();
  });

  exports("getPlayerByLicense", (license: string): FrameworkPlayer | undefined => {
    return playerManager.getPlayerByLicense(license);
  });

  // Character exports
  exports("getCharacter", (source: number): PlayerCharacter | null => {
    return playerManager.getCharacter(source);
  });

  exports("setCharacter", (source: number, character: PlayerCharacter): void => {
    playerManager.setCharacter(source, character);
  });

  // Money exports
  exports("addMoney", (source: number, type: "cash" | "bank", amount: number): boolean => {
    return playerManager.addMoney(source, type, amount);
  });

  exports("removeMoney", (source: number, type: "cash" | "bank", amount: number): boolean => {
    return playerManager.removeMoney(source, type, amount);
  });

  exports("getMoney", (source: number, type: "cash" | "bank"): number => {
    return playerManager.getMoney(source, type);
  });

  // Permission exports
  exports("hasPermission", (source: number, permission: string): boolean => {
    return permissionManager.hasPermission(source, permission);
  });

  exports("hasLevel", (source: number, level: string): boolean => {
    return permissionManager.hasLevel(source, level as any);
  });

  exports("isAdmin", (source: number): boolean => {
    return permissionManager.isAdmin(source);
  });

  exports("setPermissionLevel", (source: number, level: string): void => {
    permissionManager.setLevel(source, level as any);
  });

  exports("addPermission", (source: number, permission: string): void => {
    permissionManager.addPermission(source, permission);
  });

  exports("removePermission", (source: number, permission: string): void => {
    permissionManager.removePermission(source, permission);
  });

  console.log("[core] Exports registered");
}
