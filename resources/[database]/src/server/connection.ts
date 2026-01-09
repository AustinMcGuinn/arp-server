import { drizzle } from "drizzle-orm/planetscale-serverless";
import { Client } from "@planetscale/database";
import * as schema from "./schema";

// Get database URL from convars
const DATABASE_URL = GetConvar("database_url", "");

if (!DATABASE_URL) {
  console.error("[database] DATABASE_URL convar not set!");
}

// Create PlanetScale client
const client = new Client({
  url: DATABASE_URL,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await client.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("[database] Connection test failed:", error);
    return false;
  }
}

/**
 * Execute raw SQL query
 */
export async function executeRaw(sql: string, params?: unknown[]): Promise<any> {
  try {
    const result = await client.execute(sql, params);
    return result;
  } catch (error) {
    console.error("[database] Query error:", error);
    throw error;
  }
}
