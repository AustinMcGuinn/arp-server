import * as userQueries from "./queries/users";
import * as characterQueries from "./queries/characters";
import * as vehicleQueries from "./queries/vehicles";
import * as inventoryQueries from "./queries/inventories";
import * as jobQueries from "./queries/jobs";
import { executeRaw } from "./connection";

/**
 * Register all database exports
 */
export function registerExports(): void {
  // User exports
  exports("getUserByLicense", userQueries.getUserByLicense);
  exports("upsertUser", userQueries.upsertUser);
  exports("updateUserTokens", userQueries.updateUserTokens);
  exports("addUserTokens", userQueries.addUserTokens);

  // Character exports
  exports("getCharactersByLicense", characterQueries.getCharactersByLicense);
  exports("getCharacterById", characterQueries.getCharacterById);
  exports("createCharacter", characterQueries.createCharacter);
  exports("updateCharacter", characterQueries.updateCharacter);
  exports("deleteCharacter", characterQueries.deleteCharacter);
  exports("updateCharacterPosition", characterQueries.updateCharacterPosition);
  exports("updateCharacterMoney", characterQueries.updateCharacterMoney);
  exports("updateCharacterJob", characterQueries.updateCharacterJob);
  exports("updateLastPlayed", characterQueries.updateLastPlayed);
  exports("countCharacters", characterQueries.countCharacters);

  // Vehicle exports
  exports("getVehiclesByCharacter", vehicleQueries.getVehiclesByCharacter);
  exports("getVehicleById", vehicleQueries.getVehicleById);
  exports("getVehicleByPlate", vehicleQueries.getVehicleByPlate);
  exports("createVehicle", vehicleQueries.createVehicle);
  exports("updateVehicle", vehicleQueries.updateVehicle);
  exports("deleteVehicle", vehicleQueries.deleteVehicle);
  exports("getGarageVehicles", vehicleQueries.getGarageVehicles);
  exports("updateVehicleState", vehicleQueries.updateVehicleState);
  exports("updateVehicleMods", vehicleQueries.updateVehicleMods);
  exports("updateVehicleCondition", vehicleQueries.updateVehicleCondition);
  exports("plateExists", vehicleQueries.plateExists);

  // Inventory exports
  exports("getInventory", inventoryQueries.getInventory);
  exports("getOrCreateInventory", inventoryQueries.getOrCreateInventory);
  exports("updateInventoryItems", inventoryQueries.updateInventoryItems);
  exports("deleteInventory", inventoryQueries.deleteInventory);
  exports("getPlayerInventory", inventoryQueries.getPlayerInventory);

  // Job exports
  exports("getAllJobs", jobQueries.getAllJobs);
  exports("getJobByName", jobQueries.getJobByName);
  exports("createJob", jobQueries.createJob);
  exports("updateJob", jobQueries.updateJob);
  exports("deleteJob", jobQueries.deleteJob);
  exports("getDefaultJob", jobQueries.getDefaultJob);
  exports("seedDefaultJobs", jobQueries.seedDefaultJobs);

  // Raw query export
  exports("executeRaw", executeRaw);

  console.log("[database] Exports registered");
}
