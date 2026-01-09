import {
  mysqlTable,
  varchar,
  int,
  datetime,
  boolean,
  json,
  float,
  text,
  index,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Users table
export const users = mysqlTable("users", {
  license: varchar("license", { length: 60 }).primaryKey(),
  discordId: varchar("discord_id", { length: 30 }),
  steamId: varchar("steam_id", { length: 30 }),
  tokens: int("tokens").default(0).notNull(),
  createdAt: datetime("created_at").defaultNow().notNull(),
  lastSeen: datetime("last_seen").defaultNow().notNull(),
});

// Characters table
export const characters = mysqlTable(
  "characters",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerLicense: varchar("owner_license", { length: 60 }).notNull(),
    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),
    dob: datetime("dob").notNull(),
    gender: varchar("gender", { length: 10 }).notNull(),
    appearance: json("appearance").$type<Record<string, unknown>>().notNull(),
    position: json("position")
      .$type<{ x: number; y: number; z: number; heading: number }>()
      .notNull(),
    cash: int("cash").default(500).notNull(),
    bank: int("bank").default(5000).notNull(),
    jobName: varchar("job_name", { length: 50 }).default("unemployed").notNull(),
    jobGrade: int("job_grade").default(0).notNull(),
    isDead: boolean("is_dead").default(false).notNull(),
    createdAt: datetime("created_at").defaultNow().notNull(),
    lastPlayed: datetime("last_played").defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("owner_idx").on(table.ownerLicense),
  })
);

// Inventories table
export const inventories = mysqlTable(
  "inventories",
  {
    id: int("id").autoincrement().primaryKey(),
    inventoryType: varchar("inventory_type", { length: 20 }).notNull(),
    inventoryId: varchar("inventory_id", { length: 100 }).notNull(),
    items: json("items").$type<unknown[]>().default([]).notNull(),
    maxWeight: int("max_weight").default(100000).notNull(),
  },
  (table) => ({
    typeIdIdx: index("type_id_idx").on(table.inventoryType, table.inventoryId),
  })
);

// Vehicles table
export const vehicles = mysqlTable(
  "vehicles",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerLicense: varchar("owner_license", { length: 60 }).notNull(),
    characterId: int("character_id").notNull(),
    plate: varchar("plate", { length: 8 }).notNull().unique(),
    model: varchar("model", { length: 50 }).notNull(),
    mods: json("mods").$type<Record<string, unknown>>().default({}).notNull(),
    fuel: float("fuel").default(100).notNull(),
    bodyHealth: float("body_health").default(1000).notNull(),
    engineHealth: float("engine_health").default(1000).notNull(),
    garage: varchar("garage", { length: 50 }).default("legion").notNull(),
    state: varchar("state", { length: 20 }).default("garaged").notNull(),
  },
  (table) => ({
    ownerIdx: index("vehicle_owner_idx").on(table.ownerLicense),
    charIdx: index("vehicle_char_idx").on(table.characterId),
  })
);

// Jobs table
export const jobs = mysqlTable("jobs", {
  name: varchar("name", { length: 50 }).primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  grades: json("grades")
    .$type<
      Array<{
        grade: number;
        name: string;
        label: string;
        salary: number;
        isBoss: boolean;
      }>
    >()
    .notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  characters: many(characters),
  vehicles: many(vehicles),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  owner: one(users, {
    fields: [characters.ownerLicense],
    references: [users.license],
  }),
  vehicles: many(vehicles),
  job: one(jobs, {
    fields: [characters.jobName],
    references: [jobs.name],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  owner: one(users, {
    fields: [vehicles.ownerLicense],
    references: [users.license],
  }),
  character: one(characters, {
    fields: [vehicles.characterId],
    references: [characters.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;

export type Inventory = typeof inventories.$inferSelect;
export type NewInventory = typeof inventories.$inferInsert;

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
