import type { CreateCharacterInput } from "@framework/types";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Character Creation...`);

// Database helper functions
function createCharacter(data: any): Promise<number> {
  return exports["[database]"].createCharacter(data);
}

function countCharacters(license: string): Promise<number> {
  return exports["[database]"].countCharacters(license);
}

function getDefaultJob(): Promise<any> {
  return exports["[database]"].getDefaultJob();
}

// Core helper functions
function getPlayer(source: number): any {
  return exports["[core]"].getPlayer(source);
}

// Handle character creation
onNet("character-creation:save", async (data: CreateCharacterInput) => {
  const source = (globalThis as any).source as number;
  const player = getPlayer(source);

  if (!player) {
    console.error(`[${RESOURCE_NAME}] Player not found: ${source}`);
    emitNet("framework:showNotification", source, "error", "Error", "Player not found");
    return;
  }

  try {
    // Check character limit
    const count = await countCharacters(player.identifiers.license);
    const maxCharacters = 5;

    if (count >= maxCharacters) {
      emitNet("framework:showNotification", source, "error", "Error", "Maximum characters reached");
      return;
    }

    // Get default job
    const defaultJob = await getDefaultJob();

    // Default spawn position
    const defaultPosition = {
      x: -269.4,
      y: -955.3,
      z: 31.2,
      heading: 205.0,
    };

    // Create character in database
    const characterId = await createCharacter({
      ownerLicense: player.identifiers.license,
      firstName: data.firstName,
      lastName: data.lastName,
      dob: new Date(data.dob),
      gender: data.gender,
      appearance: data.appearance,
      position: defaultPosition,
      cash: 500,
      bank: 5000,
      jobName: defaultJob?.name ?? "unemployed",
      jobGrade: 0,
      isDead: false,
    });

    console.log(
      `[${RESOURCE_NAME}] Character created: ${data.firstName} ${data.lastName} (ID: ${characterId})`
    );

    emitNet("framework:showNotification", source, "success", "Success", "Character created!");

    // Return to character selection
    emitNet("character-creation:close", source);
    emitNet("framework:openCharacterSelect", source);
  } catch (error) {
    console.error(`[${RESOURCE_NAME}] Error creating character:`, error);
    emitNet("framework:showNotification", source, "error", "Error", "Failed to create character");
  }
});

onNet("character-creation:cancel", () => {
  const source = (globalThis as any).source as number;
  emitNet("character-creation:close", source);
  emitNet("framework:openCharacterSelect", source);
});

console.log(`[${RESOURCE_NAME}] Character Creation loaded!`);
