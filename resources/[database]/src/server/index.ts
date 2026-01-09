import { db, testConnection } from "./connection";
import { registerExports } from "./exports";
import { registerEventHandlers } from "./handlers";
import * as schema from "./schema";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Database Resource...`);

// Test database connection on start
testConnection()
  .then((success) => {
    if (success) {
      console.log(`[${RESOURCE_NAME}] Database connection successful!`);
    } else {
      console.error(`[${RESOURCE_NAME}] Database connection failed!`);
    }
  })
  .catch((error) => {
    console.error(`[${RESOURCE_NAME}] Database connection error:`, error);
  });

// Register exports
registerExports();

// Register event handlers
registerEventHandlers();

// Export database and schema for other resources
export { db, schema };

console.log(`[${RESOURCE_NAME}] Database Resource loaded!`);
