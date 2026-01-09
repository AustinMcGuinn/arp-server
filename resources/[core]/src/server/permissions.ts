import { getConfig } from "../shared";

type PermissionLevel = "user" | "moderator" | "admin" | "superadmin" | "owner";

interface PlayerPermission {
  level: PermissionLevel;
  customPermissions: Set<string>;
}

export class PermissionManager {
  private playerPermissions: Map<number, PlayerPermission> = new Map();

  /**
   * Get numeric level for a permission
   */
  private getLevelValue(level: PermissionLevel): number {
    const config = getConfig();
    return config.permissionLevels[level] ?? 0;
  }

  /**
   * Set player permission level
   */
  setLevel(source: number, level: PermissionLevel): void {
    const existing = this.playerPermissions.get(source);
    if (existing) {
      existing.level = level;
    } else {
      this.playerPermissions.set(source, {
        level,
        customPermissions: new Set(),
      });
    }
  }

  /**
   * Get player permission level
   */
  getLevel(source: number): PermissionLevel {
    return this.playerPermissions.get(source)?.level ?? "user";
  }

  /**
   * Check if player has minimum permission level
   */
  hasLevel(source: number, requiredLevel: PermissionLevel): boolean {
    const playerLevel = this.getLevel(source);
    return this.getLevelValue(playerLevel) >= this.getLevelValue(requiredLevel);
  }

  /**
   * Add custom permission to player
   */
  addPermission(source: number, permission: string): void {
    const existing = this.playerPermissions.get(source);
    if (existing) {
      existing.customPermissions.add(permission);
    } else {
      this.playerPermissions.set(source, {
        level: "user",
        customPermissions: new Set([permission]),
      });
    }
  }

  /**
   * Remove custom permission from player
   */
  removePermission(source: number, permission: string): void {
    this.playerPermissions.get(source)?.customPermissions.delete(permission);
  }

  /**
   * Check if player has custom permission
   */
  hasPermission(source: number, permission: string): boolean {
    // Owners have all permissions
    if (this.hasLevel(source, "owner")) return true;

    return this.playerPermissions.get(source)?.customPermissions.has(permission) ?? false;
  }

  /**
   * Get all player permissions
   */
  getPermissions(source: number): string[] {
    return Array.from(this.playerPermissions.get(source)?.customPermissions ?? []);
  }

  /**
   * Check if player is admin or higher
   */
  isAdmin(source: number): boolean {
    return this.hasLevel(source, "admin");
  }

  /**
   * Check if player is moderator or higher
   */
  isModerator(source: number): boolean {
    return this.hasLevel(source, "moderator");
  }

  /**
   * Clear player permissions (on disconnect)
   */
  clearPlayer(source: number): void {
    this.playerPermissions.delete(source);
  }
}
