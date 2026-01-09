import { z } from "zod";

export const CharacterAppearanceSchema = z.object({
    model: z.string(),
    components: z.record(z.number(), z.object({
        drawable: z.number(),
        texture: z.number(),
        palette: z.number().optional(),
    })),
    props: z.record(z.number(), z.object({
        drawable: z.number(),
        texture: z.number(),
    })),
    headBlend: z.object({
        shapeFirst: z.number(),
        shapeSecond: z.number(),
        shapeThird: z.number(),
        skinFirst: z.number(),
        skinSecond: z.number(),
        skinThird: z.number(),
        shapeMix: z.number(),
        skinMix: z.number(),
        thirdMix: z.number(),
    }),
    faceFeatures: z.array(z.number()),
    headOverlays: z.record(z.number(), z.object({
        index: z.number(),
        opacity: z.number(),
        color: z.number().optional(),
        secondColor: z.number().optional(),
    })),
    hairColor: z.object({
        primary: z.number(),
        secondary: z.number(),
    }),
    eyeColor: z.number(),
});

export type CharacterAppearance = z.infer<typeof CharacterAppearanceSchema>;

export const CreateCharacterSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: z.enum(["male", "female"]),
    appearance: CharacterAppearanceSchema,
});

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;

export interface CharacterData {
    id: number;
    ownerLicense: string;
    firstName: string;
    lastName: string;
    dob: Date;
    gender: "male" | "female";
    appearance: CharacterAppearance;
    position: { x: number; y: number; z: number; heading: number };
    cash: number;
    bank: number;
    jobName: string;
    jobGrade: number;
    isDead: boolean;
    createdAt: Date;
}
