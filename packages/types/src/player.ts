import { z } from "zod";

export const PlayerIdentifiersSchema = z.object({
  license: z.string(),
  discord: z.string().optional(),
  steam: z.string().optional(),
  ip: z.string().optional(),
});

export type PlayerIdentifiers = z.infer<typeof PlayerIdentifiersSchema>;

export interface FrameworkPlayer {
  source: number;
  identifiers: PlayerIdentifiers;
  name: string;
  character: PlayerCharacter | null;
}

export interface PlayerCharacter {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: Date;
  gender: "male" | "female";
  cash: number;
  bank: number;
  job: PlayerJob;
  position: Vector3;
  isDead: boolean;
}

export interface PlayerJob {
  name: string;
  label: string;
  grade: number;
  gradeLabel: string;
  onDuty: boolean;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector4 extends Vector3 {
  w: number;
}
