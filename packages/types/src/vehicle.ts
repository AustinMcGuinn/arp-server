import { z } from "zod";

export interface VehicleMods {
  modEngine: number;
  modBrakes: number;
  modTransmission: number;
  modSuspension: number;
  modArmor: number;
  modTurbo: boolean;
  modSmokeEnabled: boolean;
  modXenon: boolean;
  windowTint: number;
  neonEnabled: [boolean, boolean, boolean, boolean];
  neonColor: [number, number, number];
  tyreSmokeColor: [number, number, number];
  wheels: number;
  wheelType: number;
  extras: Record<number, boolean>;
  livery: number;
  plateIndex: number;
  color1: number | [number, number, number];
  color2: number | [number, number, number];
  pearlescentColor: number;
  wheelColor: number;
  dashboardColor: number;
  interiorColor: number;
}

export type VehicleState = "out" | "garaged" | "impounded" | "destroyed";

export interface OwnedVehicle {
  id: number;
  ownerLicense: string;
  characterId: number;
  plate: string;
  model: string;
  mods: Partial<VehicleMods>;
  fuel: number;
  bodyHealth: number;
  engineHealth: number;
  garage: string;
  state: VehicleState;
}

export interface GarageLocation {
  id: string;
  label: string;
  position: { x: number; y: number; z: number };
  spawnPoints: Array<{ x: number; y: number; z: number; heading: number }>;
  vehicleTypes: VehicleType[];
}

export type VehicleType = 
  | "car"
  | "motorcycle"
  | "boat"
  | "aircraft"
  | "bicycle";

export const SpawnVehicleSchema = z.object({
  vehicleId: z.number().int().positive(),
  garageId: z.string(),
});

export type SpawnVehicleInput = z.infer<typeof SpawnVehicleSchema>;

export const StoreVehicleSchema = z.object({
  vehicleNetId: z.number().int(),
  garageId: z.string(),
});

export type StoreVehicleInput = z.infer<typeof StoreVehicleSchema>;
