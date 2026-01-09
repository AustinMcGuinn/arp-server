import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, readdirSync, statSync } from "fs";
import { spawn } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const isWatch = process.argv.includes("--watch");
const resourceFilter = process.argv.find((arg) => arg.startsWith("--resource="))?.split("=")[1];

// Find all resources with NUI
const resourcesDir = resolve(rootDir, "resources");
const resources = readdirSync(resourcesDir).filter((name) => {
  const path = resolve(resourcesDir, name);
  const nuiPath = resolve(path, "nui");
  return statSync(path).isDirectory() && existsSync(nuiPath);
});

console.log(`Found resources with NUI: ${resources.join(", ") || "none"}`);

// Build NUI for a resource
async function buildNui(resourceName) {
  const nuiDir = resolve(resourcesDir, resourceName, "nui");
  
  return new Promise((resolve, reject) => {
    const command = isWatch ? "dev" : "build";
    const proc = spawn("pnpm", [command], {
      cwd: nuiDir,
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0 || isWatch) {
        resolve();
      } else {
        reject(new Error(`NUI build failed for ${resourceName}`));
      }
    });

    proc.on("error", reject);
  });
}

// Main
async function main() {
  const targetResources = resourceFilter
    ? resources.filter((r) => r.includes(resourceFilter))
    : resources;

  if (targetResources.length === 0) {
    console.log("No resources with NUI found");
    return;
  }

  if (isWatch) {
    // Run all NUI dev servers in parallel
    await Promise.all(targetResources.map(buildNui));
  } else {
    // Build sequentially
    for (const resource of targetResources) {
      console.log(`Building NUI for ${resource}...`);
      await buildNui(resource);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
