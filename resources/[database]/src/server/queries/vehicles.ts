import { eq, and } from "drizzle-orm";
import { db } from "../connection";
import { vehicles, type Vehicle, type NewVehicle } from "../schema";

/**
 * Get all vehicles for a character
 */
export async function getVehiclesByCharacter(characterId: number): Promise<Vehicle[]> {
  return db.query.vehicles.findMany({
    where: eq(vehicles.characterId, characterId),
  });
}

/**
 * Get vehicle by ID
 */
export async function getVehicleById(id: number): Promise<Vehicle | undefined> {
  return db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
  });
}

/**
 * Get vehicle by plate
 */
export async function getVehicleByPlate(plate: string): Promise<Vehicle | undefined> {
  return db.query.vehicles.findFirst({
    where: eq(vehicles.plate, plate),
  });
}

/**
 * Create vehicle
 */
export async function createVehicle(data: NewVehicle): Promise<number> {
  const result = await db.insert(vehicles).values(data);
  return Number(result.insertId);
}

/**
 * Update vehicle
 */
export async function updateVehicle(
  id: number,
  data: Partial<Omit<Vehicle, "id" | "ownerLicense" | "characterId">>
): Promise<void> {
  await db.update(vehicles).set(data).where(eq(vehicles.id, id));
}

/**
 * Delete vehicle
 */
export async function deleteVehicle(id: number): Promise<void> {
  await db.delete(vehicles).where(eq(vehicles.id, id));
}

/**
 * Get vehicles in garage
 */
export async function getGarageVehicles(
  characterId: number,
  garage: string
): Promise<Vehicle[]> {
  return db.query.vehicles.findMany({
    where: and(
      eq(vehicles.characterId, characterId),
      eq(vehicles.garage, garage),
      eq(vehicles.state, "garaged")
    ),
  });
}

/**
 * Update vehicle state
 */
export async function updateVehicleState(
  id: number,
  state: "out" | "garaged" | "impounded" | "destroyed"
): Promise<void> {
  await db.update(vehicles).set({ state }).where(eq(vehicles.id, id));
}

/**
 * Update vehicle mods
 */
export async function updateVehicleMods(
  id: number,
  mods: Record<string, unknown>
): Promise<void> {
  await db.update(vehicles).set({ mods }).where(eq(vehicles.id, id));
}

/**
 * Update vehicle condition
 */
export async function updateVehicleCondition(
  id: number,
  fuel: number,
  bodyHealth: number,
  engineHealth: number
): Promise<void> {
  await db
    .update(vehicles)
    .set({ fuel, bodyHealth, engineHealth })
    .where(eq(vehicles.id, id));
}

/**
 * Check if plate exists
 */
export async function plateExists(plate: string): Promise<boolean> {
  const result = await getVehicleByPlate(plate);
  return result !== undefined;
}
