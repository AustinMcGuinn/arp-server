import type { CharacterData, CharacterAppearance } from "./character";
import type { Inventory, InventoryItem } from "./inventory";

// NUI Message Types
export interface NuiMessage<T = unknown> {
  action: string;
  data: T;
}

// Character Selection
export interface CharacterSelectData {
  characters: CharacterCardData[];
  maxCharacters: number;
}

export interface CharacterCardData {
  id: number;
  firstName: string;
  lastName: string;
  job: string;
  jobGrade: string;
  cash: number;
  bank: number;
  lastPlayed: Date;
}

// Character Creation
export interface CharacterCreateData {
  gender: "male" | "female";
  appearance: CharacterAppearance;
}

// Inventory
export interface InventoryOpenData {
  primary: Inventory;
  secondary?: Inventory;
}

// Notification
export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
}

// NUI Responses
export interface NuiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
