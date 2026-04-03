import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { logger } from "./logger.js";
import { config } from "../config.js";

export const plugins = new Map();

// Recolhe todos os ficheiros .js recursivamente em todas as subpastas
function collectJsFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(fullPath);
    }
  }
  return results;
}

// Gera um nome único para o plugin baseado no caminho relativo
// ex: plugins/admin/anti-img.js → "admin/anti-img"
function pluginName(filePath, baseDir) {
  const rel = path.relative(baseDir, filePath);
  return rel.replace(/\\/g, "/").replace(/\.js$/, "");
}

export async function loadPlugins(dir = config.pluginsDir) {
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) {
    fs.mkdirSync(absDir, { recursive: true });
    logger.warn({ dir: absDir }, "[Plugins] Directory not found, created it");
    return;
  }

  const files = collectJsFiles(absDir);

  for (const file of files) {
    await loadPlugin(file, absDir);
  }

  logger.info({ count: plugins.size }, "[Plugins] Loaded all plugins");
}

export async function loadPlugin(filePath, baseDir) {
  const absBase = path.resolve(baseDir ?? config.pluginsDir);
  const name = pluginName(filePath, absBase);
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
    logger.error({ name, err: err.message }, "[Plugins] Failed to load plugin");
  }
}

export function watchPlugins(dir = config.pluginsDir) {
  const absDir = path.resolve(dir);
  if (!fs.existsSync(absDir)) return;

  const debounceTimers = new Map();

  // Função de watch aplicada a um directório
  function watchDir(targetDir) {
    fs.watch(targetDir, { recursive: false }, async (event, filename) => {
      if (!filename) return;

      const fullPath = path.join(targetDir, filename);

      // Se for uma nova subpasta, começar a observá-la também
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        watchDir(fullPath);
        return;
      }

      if (!filename.endsWith(".js")) return;

      const name = pluginName(fullPath, absDir);

      if (debounceTimers.has(name)) {
        clearTimeout(debounceTimers.get(name));
      }

      debounceTimers.set(
        name,
        setTimeout(async () => {
          debounceTimers.delete(name);

          if (event === "rename" && !fs.existsSync(fullPath)) {
            plugins.delete(name);
            logger.info({ name }, "[Plugins] Plugin removed");
            return;
          }

          logger.info({ name, event }, "[Plugins] Plugin changed, reloading...");
          await loadPlugin(fullPath, absDir);
        }, 300)
      );
    });
  }

  // Observa o directório raiz e todas as subpastas existentes
  watchDir(absDir);
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      watchDir(path.join(absDir, entry.name));
    }
  }

  logger.info({ dir: absDir }, "[Plugins] Watching for plugin changes (recursive)");
}
