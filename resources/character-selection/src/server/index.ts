import type { CharacterData } from "@framework/types";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Character Selection...`);

// Database helper functions
function getCharactersByLicense(license: string): Promise<any[]> {
  return exports["[database]"].getCharactersByLicense(license);
}

function getCharacterById(id: number): Promise<any> {
  return exports["[database]"].getCharacterById(id);
}

function deleteCharacter(id: number, license: string): Promise<boolean> {
  return exports["[database]"].deleteCharacter(id, license);
}

function countCharacters(license: string): Promise<number> {
  return exports["[database]"].countCharacters(license);
}

function updateLastPlayed(id: number): Promise<void> {
  return exports["[database]"].updateLastPlayed(id);
}

// Get player from core
function getPlayer(source: number): any {
  return exports["[core]"].getPlayer(source);
}

function setCharacter(source: number, character: any): void {
  exports["[core]"].setCharacter(source, character);
}

// Net events
onNet("character-selection:getCharacters", async () => {
  const source = (globalThis as any).source as number;
  const player = getPlayer(source);

  if (!player) {
    console.error(`[${RESOURCE_NAME}] Player not found: ${source}`);
    return;
  }

  try {
    const characters = await getCharactersByLicense(player.identifiers.license);
    const maxCharacters = 5; // Could be from config

    const characterCards = characters.map((char: any) => ({
      id: char.id,
      firstName: char.firstName,
      lastName: char.lastName,
      job: char.jobName,
      jobGrade: String(char.jobGrade),
      cash: char.cash,
      bank: char.bank,
      lastPlayed: char.lastPlayed,
    }));

    emitNet("character-selection:receiveCharacters", source, {
      characters: characterCards,
      maxCharacters,
    });
  } catch (error) {
    console.error(`[${RESOURCE_NAME}] Error fetching characters:`, error);
    emitNet("character-selection:receiveCharacters", source, {
      characters: [],
      maxCharacters: 5,
    });
  }
});

onNet("character-selection:selectCharacter", async (characterId: number) => {
  const source = (globalThis as any).source as number;
  const player = getPlayer(source);

  if (!player) return;

  try {
    const character = await getCharacterById(characterId);

    if (!character) {
      emitNet("framework:showNotification", source, "error", "Error", "Character not found");
      return;
    }

    // Verify ownership
    if (character.ownerLicense !== player.identifiers.license) {
      emitNet("framework:showNotification", source, "error", "Error", "This is not your character");
      return;
    }

    // Update last played
    await updateLastPlayed(characterId);

    // Get job info
    const job = await exports["[database]"].getJobByName(character.jobName);
    const grade = job?.grades?.find((g: any) => g.grade === character.jobGrade);

    // Format character for core
    const playerCharacter = {
      id: character.id,
      firstName: character.firstName,
      lastName: character.lastName,
      fullName: `${character.firstName} ${character.lastName}`,
      dob: new Date(character.dob),
      gender: character.gender,
      cash: character.cash,
      bank: character.bank,
      job: {
        name: character.jobName,
        label: job?.label ?? "Unemployed",
        grade: character.jobGrade,
        gradeLabel: grade?.label ?? "Unemployed",
        onDuty: false,
      },
      position: character.position,
      isDead: character.isDead,
    };

    // Set character in core
    setCharacter(source, playerCharacter);

    // Tell client to spawn
    emitNet("character-selection:spawnCharacter", source, {
      appearance: character.appearance,
      position: character.position,
    });

    console.log(`[${RESOURCE_NAME}] Character selected: ${character.firstName} ${character.lastName}`);
  } catch (error) {
    console.error(`[${RESOURCE_NAME}] Error selecting character:`, error);
    emitNet("framework:showNotification", source, "error", "Error", "Failed to select character");
  }
});

onNet("character-selection:deleteCharacter", async (characterId: number) => {
  const source = (globalThis as any).source as number;
  const player = getPlayer(source);

  if (!player) return;

  try {
    const deleted = await deleteCharacter(characterId, player.identifiers.license);

    if (deleted) {
      emitNet("framework:showNotification", source, "success", "Success", "Character deleted");
      // Refresh character list
      emit("character-selection:getCharacters");
    } else {
      emitNet("framework:showNotification", source, "error", "Error", "Failed to delete character");
    }
  } catch (error) {
    console.error(`[${RESOURCE_NAME}] Error deleting character:`, error);
    emitNet("framework:showNotification", source, "error", "Error", "Failed to delete character");
  }
});

onNet("character-selection:createNew", async () => {
  const source = (globalThis as any).source as number;
  const player = getPlayer(source);

  if (!player) return;

  try {
    const count = await countCharacters(player.identifiers.license);
    const maxCharacters = 5;

    if (count >= maxCharacters) {
      emitNet("framework:showNotification", source, "error", "Error", "Maximum characters reached");
      return;
    }

    // Open character creation
    emitNet("character-creation:open", source);
  } catch (error) {
    console.error(`[${RESOURCE_NAME}] Error checking character count:`, error);
  }
});

console.log(`[${RESOURCE_NAME}] Character Selection loaded!`);
