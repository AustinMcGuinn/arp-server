import type { Vector4 } from "@framework/types";
import { getConfig } from "../shared";

export class SpawnManager {
  private hasSpawned: boolean = false;

  /**
   * Spawn player at a location
   */
  async spawnAt(coords: Vector4, model?: string): Promise<void> {
    const playerPed = PlayerPedId();

    // Load model if specified
    if (model) {
      const hash = GetHashKey(model);
      RequestModel(hash);
      
      while (!HasModelLoaded(hash)) {
        await this.wait(10);
      }

      SetPlayerModel(PlayerId(), hash);
      SetModelAsNoLongerNeeded(hash);
    }

    // Freeze and set position
    const ped = PlayerPedId();
    FreezeEntityPosition(ped, true);
    SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false);
    SetEntityHeading(ped, coords.w);

    // Wait for collision to load
    RequestCollisionAtCoord(coords.x, coords.y, coords.z);
    while (!HasCollisionLoadedAroundEntity(ped)) {
      await this.wait(10);
    }

    // Unfreeze
    FreezeEntityPosition(ped, false);

    // Mark as spawned
    this.hasSpawned = true;

    // Show radar
    DisplayRadar(true);
  }

  /**
   * Spawn at default location
   */
  async spawnDefault(): Promise<void> {
    const config = getConfig();
    await this.spawnAt({
      x: config.defaultSpawn.x,
      y: config.defaultSpawn.y,
      z: config.defaultSpawn.z,
      w: config.defaultSpawn.heading,
    });
  }

  /**
   * Check if player has spawned
   */
  hasPlayerSpawned(): boolean {
    return this.hasSpawned;
  }

  /**
   * Freeze player
   */
  freeze(freeze: boolean): void {
    const ped = PlayerPedId();
    FreezeEntityPosition(ped, freeze);
  }

  /**
   * Set player invisible
   */
  setInvisible(invisible: boolean): void {
    const ped = PlayerPedId();
    SetEntityVisible(ped, !invisible, false);
  }

  /**
   * Set player invincible
   */
  setInvincible(invincible: boolean): void {
    const ped = PlayerPedId();
    SetEntityInvincible(ped, invincible);
  }

  /**
   * Helper wait function
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
