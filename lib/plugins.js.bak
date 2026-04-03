import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { logger } from "./logger.js";
import { config } from "../config.js";

export const plugins = new Map();

export async function loadPlugins(dir = config.pluginsDir) {
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) {
    fs.mkdirSync(absDir, { recursive: true });
    logger.warn({ dir: absDir }, "[Plugins] Directory not found, created it");
    return;
  }

  const files = fs.readdirSync(absDir).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    await loadPlugin(path.join(absDir, file));
  }

  logger.info({ count: plugins.size }, "[Plugins] Loaded all plugins");
}

export async function loadPlugin(filePath) {
  const name = path.basename(filePath, ".js");
  try {
    const url = pathToFileURL(filePath).href + `?t=${Date.now()}`;
    const mod = await import(url);
    if (mod.default && typeof mod.default === "object") {
      plugins.set(name, mod.default);
      logger.info({ name }, "[Plugins] Loaded plugin");
    } else {
      logger.warn({ name }, "[Plugins] Plugin has no default export object, skipping");
    }
  } catch (err) {
    logger.error({ name, err }, "[Plugins] Failed to load plugin");
  }
}

export function watchPlugins(dir = config.pluginsDir) {
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) return;

  const debounceTimers = new Map();

  fs.watch(absDir, async (event, filename) => {
    if (!filename?.endsWith(".js")) return;

    const filePath = path.join(absDir, filename);
    const name = path.basename(filename, ".js");

    if (debounceTimers.has(name)) {
      clearTimeout(debounceTimers.get(name));
    }

    debounceTimers.set(
      name,
      setTimeout(async () => {
        debounceTimers.delete(name);

        if (event === "rename" && !fs.existsSync(filePath)) {
          plugins.delete(name);
          logger.info({ name }, "[Plugins] Plugin removed");
          return;
        }

        logger.info({ name, event }, "[Plugins] Plugin changed, reloading...");
        await loadPlugin(filePath);
      }, 300)
    );
  });

  logger.info({ dir: absDir }, "[Plugins] Watching for plugin changes");
}
