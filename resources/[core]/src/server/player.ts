import type { FrameworkPlayer, PlayerIdentifiers, PlayerCharacter } from "@framework/types";
import { ServerEvents } from "@framework/types";
import { RESOURCE_NAME, getConfig } from "../shared";

export class PlayerManager {
  private players: Map<number, FrameworkPlayer> = new Map();

  /**
   * Get all connected players
   */
  getPlayers(): FrameworkPlayer[] {
    return Array.from(this.players.values());
  }

  /**
   * Get a player by source
   */
  getPlayer(source: number): FrameworkPlayer | undefined {
    return this.players.get(source);
  }

  /**
   * Get a player by license
   */
  getPlayerByLicense(license: string): FrameworkPlayer | undefined {
    return this.getPlayers().find((p) => p.identifiers.license === license);
  }

  /**
   * Extract player identifiers
   */
  private getIdentifiers(source: number): PlayerIdentifiers {
    const numIds = GetNumPlayerIdentifiers(String(source));
    const identifiers: PlayerIdentifiers = {
      license: "",
    };

    for (let i = 0; i < numIds; i++) {
      const id = GetPlayerIdentifier(String(source), i);
      if (id.startsWith("license:")) {
        identifiers.license = id;
      } else if (id.startsWith("discord:")) {
        identifiers.discord = id;
      } else if (id.startsWith("steam:")) {
        identifiers.steam = id;
      } else if (id.startsWith("ip:")) {
        identifiers.ip = id;
      }
    }

    return identifiers;
  }

  /**
   * Handle player connecting
   */
  async handleConnecting(
    source: number,
    name: string,
    deferrals: {
      defer: () => void;
      update: (message: string) => void;
      done: (reason?: string) => void;
    }
  ): Promise<void> {
    const identifiers = this.getIdentifiers(source);

    // Check for license
    if (!identifiers.license) {
      deferrals.done("No license identifier found. Please restart your game.");
      return;
    }

    deferrals.update("Loading player data...");

    // Create player object
    const player: FrameworkPlayer = {
      source,
      identifiers,
      name,
      character: null,
    };

    this.players.set(source, player);

    console.log(`[${RESOURCE_NAME}] Player connecting: ${name} (${identifiers.license})`);

    deferrals.done();
  }

  /**
   * Handle player joining (fully connected)
   */
  handleJoining(source: number): void {
    const player = this.players.get(source);
    if (!player) return;

    console.log(`[${RESOURCE_NAME}] Player joined: ${player.name}`);

    // Emit player loaded event
    emit(ServerEvents.PLAYER_LOADED, source, player);

    // Trigger client-side character selection
    emitNet("framework:openCharacterSelect", source);
  }

  /**
   * Handle player dropped
   */
  handleDropped(source: number, reason: string): void {
    const player = this.players.get(source);
    if (!player) return;

    console.log(`[${RESOURCE_NAME}] Player dropped: ${player.name} - ${reason}`);

    // Emit player dropped event
    emit(ServerEvents.PLAYER_DROPPED, source, player, reason);

    // Save character data if they had one selected
    if (player.character) {
      this.saveCharacter(source);
    }

    this.players.delete(source);
  }

  /**
   * Set the active character for a player
   */
  setCharacter(source: number, character: PlayerCharacter): void {
    const player = this.players.get(source);
    if (!player) return;

    player.character = character;
    emit(ServerEvents.CHARACTER_SELECTED, source, character);
  }

  /**
   * Get the active character for a player
   */
  getCharacter(source: number): PlayerCharacter | null {
    return this.players.get(source)?.character ?? null;
  }

  /**
   * Save character data
   */
  saveCharacter(source: number): void {
    const player = this.players.get(source);
    if (!player?.character) return;

    // Get player position
    const ped = GetPlayerPed(String(source));
    const coords = GetEntityCoords(ped);

    player.character.position = {
      x: coords[0],
      y: coords[1],
      z: coords[2],
    };

    // Emit save event for database resource to handle
    emit("framework:saveCharacter", source, player.character);
  }

  /**
   * Update player money
   */
  addMoney(source: number, type: "cash" | "bank", amount: number): boolean {
    const character = this.getCharacter(source);
    if (!character) return false;

    if (type === "cash") {
      character.cash += amount;
    } else {
      character.bank += amount;
    }

    emitNet("framework:updateMoney", source, type, character[type]);
    return true;
  }

  /**
   * Remove money from player
   */
  removeMoney(source: number, type: "cash" | "bank", amount: number): boolean {
    const character = this.getCharacter(source);
    if (!character) return false;

    const current = type === "cash" ? character.cash : character.bank;
    if (current < amount) return false;

    if (type === "cash") {
      character.cash -= amount;
    } else {
      character.bank -= amount;
    }

    emitNet("framework:updateMoney", source, type, character[type]);
    return true;
  }

  /**
   * Get player money
   */
  getMoney(source: number, type: "cash" | "bank"): number {
    const character = this.getCharacter(source);
    if (!character) return 0;

    return type === "cash" ? character.cash : character.bank;
  }

  /**
   * Cleanup on resource stop
   */
  cleanup(): void {
    // Save all characters
    for (const [source] of this.players) {
      this.saveCharacter(source);
    }
    this.players.clear();
  }
}
