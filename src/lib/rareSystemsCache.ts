import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { EDSMSystem } from "../types/edsm";

const CACHE_FILE_PATH = join(process.cwd(), "data", "rareSystemsCache.json");

interface RareSystemCache {
  [systemName: string]: EDSMSystem;
  _metadata?: {
    lastUpdated: string;
    totalSystems: number;
  };
}

let cache: RareSystemCache | null = null;
let cacheLoadPromise: Promise<void> | null = null;

/**
 * Normalize system name for cache lookup (lowercase)
 */
function normalizeSystemName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Load the rare systems cache from disk
 */
async function loadCache(): Promise<void> {
  if (cache !== null) {
    return; // Already loaded
  }

  if (cacheLoadPromise) {
    return cacheLoadPromise; // Already loading
  }

  cacheLoadPromise = (async () => {
    try {
      if (existsSync(CACHE_FILE_PATH)) {
        const fileContent = await readFile(CACHE_FILE_PATH, "utf-8");
        cache = JSON.parse(fileContent);
        console.log(
          `[RareSystemsCache] Loaded ${Object.keys(cache!).filter(k => !k.startsWith('_')).length} systems from cache`
        );
      } else {
        console.warn(
          "[RareSystemsCache] Cache file not found, rare origin systems will use API lookups"
        );
        cache = {};
      }
    } catch (error) {
      console.error("[RareSystemsCache] Failed to load cache:", error);
      cache = {};
    }
  })();

  return cacheLoadPromise;
}

/**
 * Get a rare origin system from cache
 * Returns null if not found in cache (should fall back to API lookup)
 */
export async function getRareOriginSystem(
  systemName: string
): Promise<EDSMSystem | null> {
  await loadCache();

  if (!cache) {
    return null;
  }

  const cacheKey = normalizeSystemName(systemName);
  const system = cache[cacheKey];

  if (!system) {
    return null;
  }

  // Check if system has valid coordinates (not the placeholder 0,0,0)
  if (system.coords && (system.coords.x !== 0 || system.coords.y !== 0 || system.coords.z !== 0)) {
    return system;
  }

  // System is in cache but has invalid coordinates
  return null;
}

/**
 * Get cache metadata
 */
export async function getCacheMetadata(): Promise<{
  lastUpdated?: string;
  totalSystems?: number;
} | null> {
  await loadCache();
  return cache?._metadata || null;
}
