import { upsertUser } from "./queries/users";
import {
  getCharacterById,
  updateCharacter,
  updateCharacterPosition,
  updateCharacterMoney,
  updateLastPlayed,
} from "./queries/characters";
import { seedDefaultJobs } from "./queries/jobs";
import type { PlayerCharacter } from "@framework/types";

/**
 * Register event handlers
 */
export function registerEventHandlers(): void {
  // Handle player loaded - create/update user record
  on("framework:playerLoaded", async (source: number, player: any) => {
    try {
      await upsertUser({
        license: player.identifiers.license,
        discordId: player.identifiers.discord?.replace("discord:", "") ?? null,
        steamId: player.identifiers.steam?.replace("steam:", "") ?? null,
      });
      console.log(`[database] User upserted: ${player.identifiers.license}`);
    } catch (error) {
      console.error("[database] Failed to upsert user:", error);
    }
  });

  // Handle character save
  on(
    "framework:saveCharacter",
    async (source: number, character: PlayerCharacter) => {
      try {
        if (!character?.id) return;

        await updateCharacter(character.id, {
          position: character.position as any,
          cash: character.cash,
          bank: character.bank,
          jobName: character.job.name,
          jobGrade: character.job.grade,
          isDead: character.isDead,
        });

        await updateLastPlayed(character.id);
        console.log(`[database] Character saved: ${character.id}`);
      } catch (error) {
        console.error("[database] Failed to save character:", error);
      }
    }
  );

  // Seed default jobs on resource start
  on("onResourceStart", async (resourceName: string) => {
    if (resourceName === GetCurrentResourceName()) {
      try {
        await seedDefaultJobs();
        console.log("[database] Default jobs seeded");
      } catch (error) {
        console.error("[database] Failed to seed jobs:", error);
      }
    }
  });
}
