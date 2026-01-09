import { z } from "zod";

export interface JobGrade {
  grade: number;
  name: string;
  label: string;
  salary: number;
  isBoss: boolean;
}

export interface JobDefinition {
  name: string;
  label: string;
  grades: JobGrade[];
  isDefault: boolean;
  defaultDuty: boolean;
}

export interface PlayerJobData {
  name: string;
  label: string;
  grade: number;
  gradeLabel: string;
  salary: number;
  isBoss: boolean;
  onDuty: boolean;
}

export const SetJobSchema = z.object({
  characterId: z.number().int().positive(),
  jobName: z.string(),
  grade: z.number().int().min(0),
});

export type SetJobInput = z.infer<typeof SetJobSchema>;

export const HirePlayerSchema = z.object({
  targetSource: z.number().int(),
  jobName: z.string(),
  grade: z.number().int().min(0),
});

export type HirePlayerInput = z.infer<typeof HirePlayerSchema>;

export const FirePlayerSchema = z.object({
  targetCharacterId: z.number().int().positive(),
});

export type FirePlayerInput = z.infer<typeof FirePlayerSchema>;

export const SetGradeSchema = z.object({
  targetCharacterId: z.number().int().positive(),
  grade: z.number().int().min(0),
});

export type SetGradeInput = z.infer<typeof SetGradeSchema>;
