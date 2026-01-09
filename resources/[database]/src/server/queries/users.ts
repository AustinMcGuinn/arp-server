import { eq } from "drizzle-orm";
import { db } from "../connection";
import { users, type User, type NewUser } from "../schema";

/**
 * Get user by license
 */
export async function getUserByLicense(license: string): Promise<User | undefined> {
  const result = await db.query.users.findFirst({
    where: eq(users.license, license),
  });
  return result;
}

/**
 * Create or update user
 */
export async function upsertUser(data: NewUser): Promise<void> {
  await db
    .insert(users)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        lastSeen: new Date(),
        discordId: data.discordId,
        steamId: data.steamId,
      },
    });
}

/**
 * Update user tokens
 */
export async function updateUserTokens(license: string, tokens: number): Promise<void> {
  await db.update(users).set({ tokens }).where(eq(users.license, license));
}

/**
 * Add tokens to user
 */
export async function addUserTokens(license: string, amount: number): Promise<void> {
  const user = await getUserByLicense(license);
  if (!user) return;

  await db
    .update(users)
    .set({ tokens: user.tokens + amount })
    .where(eq(users.license, license));
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  return db.query.users.findMany();
}
