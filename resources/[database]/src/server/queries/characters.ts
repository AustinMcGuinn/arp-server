import { eq, and } from "drizzle-orm";
import { db } from "../connection";
import { characters, type Character, type NewCharacter } from "../schema";

/**
 * Get all characters for a license
 */
export async function getCharactersByLicense(license: string): Promise<Character[]> {
  return db.query.characters.findMany({
    where: eq(characters.ownerLicense, license),
    orderBy: (characters, { desc }) => [desc(characters.lastPlayed)],
  });
}

/**
 * Get character by ID
 */
export async function getCharacterById(id: number): Promise<Character | undefined> {
  return db.query.characters.findFirst({
    where: eq(characters.id, id),
  });
}

/**
 * Create a new character
 */
export async function createCharacter(data: NewCharacter): Promise<number> {
  const result = await db.insert(characters).values(data);
  return Number(result.insertId);
}

/**
 * Update character
 */
export async function updateCharacter(
  id: number,
  data: Partial<Omit<Character, "id" | "ownerLicense" | "createdAt">>
): Promise<void> {
  await db.update(characters).set(data).where(eq(characters.id, id));
}

/**
 * Delete character
 */
export async function deleteCharacter(id: number, ownerLicense: string): Promise<boolean> {
  const result = await db
    .delete(characters)
    .where(and(eq(characters.id, id), eq(characters.ownerLicense, ownerLicense)));
  return (result.rowsAffected ?? 0) > 0;
}

/**
 * Update character position
 */
export async function updateCharacterPosition(
  id: number,
  position: { x: number; y: number; z: number; heading: number }
): Promise<void> {
  await db.update(characters).set({ position }).where(eq(characters.id, id));
}

/**
 * Update character money
 */
export async function updateCharacterMoney(
  id: number,
  cash: number,
  bank: number
): Promise<void> {
  await db.update(characters).set({ cash, bank }).where(eq(characters.id, id));
}

/**
 * Update character job
 */
export async function updateCharacterJob(
  id: number,
  jobName: string,
  jobGrade: number
): Promise<void> {
  await db.update(characters).set({ jobName, jobGrade }).where(eq(characters.id, id));
}

/**
 * Update last played timestamp
 */
export async function updateLastPlayed(id: number): Promise<void> {
  await db.update(characters).set({ lastPlayed: new Date() }).where(eq(characters.id, id));
}

/**
 * Set character dead state
 */
export async function setCharacterDead(id: number, isDead: boolean): Promise<void> {
  await db.update(characters).set({ isDead }).where(eq(characters.id, id));
}

/**
 * Count characters for a license
 */
export async function countCharacters(license: string): Promise<number> {
  const result = await db.query.characters.findMany({
    where: eq(characters.ownerLicense, license),
    columns: { id: true },
  });
  return result.length;
}
