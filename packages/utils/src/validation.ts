import { z } from "zod";

/**
 * Safely parse data with a Zod schema
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Parse data with a Zod schema, throwing on error
 */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

/**
 * Validate FiveM license identifier
 */
export function isValidLicense(license: string): boolean {
  return /^license:[a-f0-9]{40}$/i.test(license);
}

/**
 * Validate Discord ID
 */
export function isValidDiscordId(id: string): boolean {
  return /^discord:\d{17,19}$/.test(id);
}

/**
 * Validate Steam ID
 */
export function isValidSteamId(id: string): boolean {
  return /^steam:1[0-9a-f]{14}$/i.test(id);
}

/**
 * Validate vehicle plate format
 */
export function isValidPlate(plate: string): boolean {
  return /^[A-Z0-9]{1,8}$/i.test(plate);
}
