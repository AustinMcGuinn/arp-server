import type { OwnedVehicle, VehicleState } from "@framework/types";
import { generatePlate } from "@framework/utils";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Vehicles System...`);

// Spawned vehicles (netId -> vehicleId)
const spawnedVehicles: Map<number, number> = new Map();

// Core helpers
function getCharacter(source: number): any {
  return exports["[core]"].getCharacter(source);
}

function getPlayer(source: number): any {
  return exports["[core]"].getPlayer(source);
}

// Database helpers
async function getVehiclesByCharacter(characterId: number): Promise<any[]> {
  return exports["[database]"].getVehiclesByCharacter(characterId);
}

async function getVehicleById(id: number): Promise<any> {
  return exports["[database]"].getVehicleById(id);
}

async function getGarageVehicles(characterId: number, garage: string): Promise<any[]> {
  return exports["[database]"].getGarageVehicles(characterId, garage);
}

async function createVehicle(data: any): Promise<number> {
  return exports["[database]"].createVehicle(data);
}

async function updateVehicleState(id: number, state: VehicleState): Promise<void> {
  return exports["[database]"].updateVehicleState(id, state);
}

async function updateVehicleCondition(
  id: number,
  fuel: number,
  bodyHealth: number,
  engineHealth: number
): Promise<void> {
  return exports["[database]"].updateVehicleCondition(id, fuel, bodyHealth, engineHealth);
}

async function plateExists(plate: string): Promise<boolean> {
  return exports["[database]"].plateExists(plate);
}

// Generate unique plate
async function generateUniquePlate(): Promise<string> {
  let plate: string;
  let attempts = 0;

  do {
    plate = generatePlate();
    attempts++;
  } while ((await plateExists(plate)) && attempts < 100);

  return plate;
}

// Get garage config
function getGarageConfig(garageId: string): any {
  return (globalThis as any).Config?.Garages?.[garageId];
}

// Find available spawn point
function findSpawnPoint(garageId: string): { x: number; y: number; z: number; heading: number } | null {
  const garage = getGarageConfig(garageId);
  if (!garage) return null;

  // For now, just return the first spawn point
  // In production, you'd check if the spot is occupied
  return garage.spawnPoints[0] ?? null;
}

// Spawn vehicle
async function spawnVehicle(source: number, vehicleId: number, garageId: string): Promise<number | null> {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) return null;

  const character = getCharacter(source);
  if (!character || vehicle.characterId !== character.id) return null;

  if (vehicle.state !== "garaged") {
    emitNet("framework:showNotification", source, "error", "Error", "Vehicle is not in garage");
    return null;
  }

  const spawnPoint = findSpawnPoint(garageId);
  if (!spawnPoint) {
    emitNet("framework:showNotification", source, "error", "Error", "No spawn point available");
    return null;
  }

  // Tell client to spawn vehicle
  emitNet("vehicles:spawnVehicle", source, {
    vehicleId: vehicle.id,
    model: vehicle.model,
    plate: vehicle.plate,
    mods: vehicle.mods,
    fuel: vehicle.fuel,
    bodyHealth: vehicle.bodyHealth,
    engineHealth: vehicle.engineHealth,
    spawnPoint,
  });

  // Update state
  await updateVehicleState(vehicleId, "out");

  return vehicleId;
}

// Store vehicle
async function storeVehicle(
  source: number,
  vehicleNetId: number,
  garageId: string
): Promise<boolean> {
  const vehicleId = spawnedVehicles.get(vehicleNetId);
  if (!vehicleId) return false;

  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) return false;

  const character = getCharacter(source);
  if (!character || vehicle.characterId !== character.id) return false;

  // Tell client to get vehicle data and delete it
  emitNet("vehicles:storeVehicle", source, vehicleNetId, garageId);

  return true;
}

// Net events
onNet("vehicles:openGarage", async (garageId: string) => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);

  if (!character) return;

  const garage = getGarageConfig(garageId);
  if (!garage) return;

  const vehicles = await getGarageVehicles(character.id, garageId);

  emitNet("vehicles:showGarage", source, {
    garageId,
    garageLabel: garage.label,
    vehicles: vehicles.map((v: any) => ({
      id: v.id,
      plate: v.plate,
      model: v.model,
      fuel: v.fuel,
      bodyHealth: v.bodyHealth,
      engineHealth: v.engineHealth,
    })),
  });
});

onNet("vehicles:spawn", async (vehicleId: number, garageId: string) => {
  const source = (globalThis as any).source as number;
  await spawnVehicle(source, vehicleId, garageId);
});

onNet("vehicles:vehicleSpawned", (vehicleId: number, netId: number) => {
  spawnedVehicles.set(netId, vehicleId);
});

onNet("vehicles:store", async (netId: number, garageId: string) => {
  const source = (globalThis as any).source as number;
  await storeVehicle(source, netId, garageId);
});

onNet(
  "vehicles:storeComplete",
  async (vehicleId: number, garageId: string, condition: { fuel: number; body: number; engine: number }) => {
    await updateVehicleCondition(vehicleId, condition.fuel, condition.body, condition.engine);
    await updateVehicleState(vehicleId, "garaged");

    // Remove from spawned
    for (const [netId, vId] of spawnedVehicles) {
      if (vId === vehicleId) {
        spawnedVehicles.delete(netId);
        break;
      }
    }
  }
);

// Give vehicle (admin/shop)
onNet("vehicles:give", async (model: string, mods?: Record<string, unknown>) => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);
  const player = getPlayer(source);

  if (!character || !player) return;

  const plate = await generateUniquePlate();

  const vehicleId = await createVehicle({
    ownerLicense: player.identifiers.license,
    characterId: character.id,
    plate,
    model,
    mods: mods ?? {},
    fuel: 100,
    bodyHealth: 1000,
    engineHealth: 1000,
    garage: "legion",
    state: "garaged",
  });

  emitNet("framework:showNotification", source, "success", "Success", `Vehicle purchased! Plate: ${plate}`);
});

// Exports
exports("spawnVehicle", spawnVehicle);
exports("storeVehicle", storeVehicle);
exports("giveVehicle", async (source: number, model: string, mods?: Record<string, unknown>) => {
  const character = getCharacter(source);
  const player = getPlayer(source);

  if (!character || !player) return null;

  const plate = await generateUniquePlate();

  return createVehicle({
    ownerLicense: player.identifiers.license,
    characterId: character.id,
    plate,
    model,
    mods: mods ?? {},
    fuel: 100,
    bodyHealth: 1000,
    engineHealth: 1000,
    garage: "legion",
    state: "garaged",
  });
});

console.log(`[${RESOURCE_NAME}] Vehicles System loaded!`);
