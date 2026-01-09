import * as esbuild from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const isWatch = process.argv.includes("--watch");
const resourceFilter = process.argv.find((arg) => arg.startsWith("--resource="))?.split("=")[1];

// Shared esbuild config
const baseConfig = {
  bundle: true,
  format: "iife",
  target: "es2020",
  logLevel: "info",
  keepNames: true,
  legalComments: "none",
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production" ? "inline" : false,
};

// Find all resources
const resourcesDir = resolve(rootDir, "resources");
const resources = readdirSync(resourcesDir).filter((name) => {
  const path = resolve(resourcesDir, name);
  return statSync(path).isDirectory() && existsSync(resolve(path, "fxmanifest.lua"));
});

console.log(`Found resources: ${resources.join(", ")}`);

// Build a single resource
async function buildResource(resourceName) {
  const resourceDir = resolve(resourcesDir, resourceName);
  const srcDir = resolve(resourceDir, "src");
  const distDir = resolve(resourceDir, "dist");

  // Ensure dist directory exists
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  const contexts = [];

  // Server build
  const serverEntry = resolve(srcDir, "server/index.ts");
  if (existsSync(serverEntry)) {
    const ctx = await esbuild.context({
      ...baseConfig,
      entryPoints: [serverEntry],
      outfile: resolve(distDir, "server.js"),
      platform: "node",
      external: ["@citizenfx/*"],
    });
    contexts.push({ ctx, name: "server" });
  }

  // Client build
  const clientEntry = resolve(srcDir, "client/index.ts");
  if (existsSync(clientEntry)) {
    const ctx = await esbuild.context({
      ...baseConfig,
      entryPoints: [clientEntry],
      outfile: resolve(distDir, "client.js"),
      platform: "browser",
      external: ["@citizenfx/*"],
    });
    contexts.push({ ctx, name: "client" });
  }

  if (isWatch) {
    console.log(`Watching ${resourceName}...`);
    await Promise.all(contexts.map(({ ctx }) => ctx.watch()));
  } else {
    for (const { ctx, name } of contexts) {
      const result = await ctx.rebuild();
      console.log(`Built ${resourceName}/${name}`);
      await ctx.dispose();
    }
  }

  return contexts;
}

// Main
async function main() {
  const targetResources = resourceFilter 
    ? resources.filter(r => r.includes(resourceFilter))
    : resources;

  if (targetResources.length === 0) {
    console.error("No resources found to build");
    process.exit(1);
  }

  const allContexts = [];
  
  for (const resource of targetResources) {
    try {
      const contexts = await buildResource(resource);
      allContexts.push(...contexts);
    } catch (error) {
      console.error(`Failed to build ${resource}:`, error);
      if (!isWatch) process.exit(1);
    }
  }

  if (isWatch) {
    console.log("\nWatching for changes...");
    process.on("SIGINT", async () => {
      console.log("\nStopping watch...");
      await Promise.all(allContexts.map(({ ctx }) => ctx.dispose()));
      process.exit(0);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
