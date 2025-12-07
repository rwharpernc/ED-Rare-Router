import type { EDSMSystem } from "../types/edsm";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const EDSM_API_BASE = "https://www.edsm.net/api-v1";
const CACHE_FILE_PATH = join(process.cwd(), "data", "systemCache.json");
const SEARCH_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for search results
const DISK_WRITE_DEBOUNCE_MS = 5000; // 5 seconds debounce for disk writes
const FETCH_TIMEOUT_MS = 10000; // 10 seconds timeout for fetch calls

// User-Agent header for polite API usage
const USER_AGENT =
  process.env.EDSM_USER_AGENT ??
  "ED-Rare-Router/1.0 (contact: https://github.com/your-org/ed-rare-router)";

/**
 * Cache entry for search results with TTL
 */
interface SearchCacheEntry {
  data: EDSMSystem[];
  expiresAt: number;
}

/**
 * In-memory cache for exact system lookups (no TTL, persists for process lifetime)
 */
const systemCache = new Map<string, EDSMSystem>();

/**
 * In-memory cache for search results with TTL
 */
const searchCache = new Map<string, SearchCacheEntry>();

/**
 * Flag to track if the disk cache needs to be written
 */
let diskCacheDirty = false;

/**
 * Timer handle for debounced disk writes
 */
let diskWriteTimer: NodeJS.Timeout | null = null;

/**
 * Load the disk-backed cache on module initialization
 */
async function loadDiskCache(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Try to read existing cache file
    if (existsSync(CACHE_FILE_PATH)) {
      const fileContent = await readFile(CACHE_FILE_PATH, "utf-8");
      const cacheData: Record<string, EDSMSystem> = JSON.parse(fileContent);

      // Load into in-memory cache
      for (const [key, system] of Object.entries(cacheData)) {
        systemCache.set(key, system);
      }

      console.log(
        `[EDSM] Loaded ${Object.keys(cacheData).length} systems from disk cache`
      );
    }
  } catch (error) {
    // If file doesn't exist or is invalid, start with empty cache
    console.warn("[EDSM] Could not load disk cache, starting fresh:", error);
  }
}

/**
 * Schedule a debounced write of the in-memory cache to disk
 */
function scheduleDiskWrite(): void {
  // Clear existing timer if any
  if (diskWriteTimer) {
    clearTimeout(diskWriteTimer);
  }

  // Mark cache as dirty
  diskCacheDirty = true;

  // Schedule write after debounce period
  diskWriteTimer = setTimeout(async () => {
    await writeDiskCache();
    diskCacheDirty = false;
    diskWriteTimer = null;
  }, DISK_WRITE_DEBOUNCE_MS);
}

/**
 * Write the in-memory cache to disk atomically
 */
async function writeDiskCache(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Convert Map to plain object for JSON serialization
    const cacheObject: Record<string, EDSMSystem> = {};
    for (const [key, system] of systemCache.entries()) {
      cacheObject[key] = system;
    }

    // Write to disk with pretty printing
    const jsonContent = JSON.stringify(cacheObject, null, 2);
    await writeFile(CACHE_FILE_PATH, jsonContent, "utf-8");

    console.log(
      `[EDSM] Wrote ${Object.keys(cacheObject).length} systems to disk cache`
    );
  } catch (error) {
    console.error("[EDSM] Failed to write disk cache:", error);
  }
}

/**
 * Normalize a system name for use as a cache key
 */
function normalizeSystemName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Create a fetch request with timeout and proper headers
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Normalize EDSM API response to our EDSMSystem type
 */
function normalizeEDSMResponse(
  data: any,
  fallbackName?: string
): EDSMSystem | null {
  // EDSM API can return different response formats
  // Check for coordinates in multiple possible locations
  const coords = data?.coords || data?.coordinates;
  
  if (!data || !coords) {
    // Log for debugging
    console.warn("[EDSM] Invalid response format:", {
      hasData: !!data,
      hasCoords: !!coords,
      dataKeys: data ? Object.keys(data) : [],
    });
    return null;
  }

  return {
    name: data.name || data.systemName || fallbackName || "Unknown",
    coords: {
      x: coords.x ?? coords.xCoord ?? 0,
      y: coords.y ?? coords.yCoord ?? 0,
      z: coords.z ?? coords.zCoord ?? 0,
    },
    allegiance: data.information?.allegiance || data.allegiance,
    government: data.information?.government || data.government,
  };
}

// Initialize: Load disk cache on module load
loadDiskCache().catch((error) => {
  console.error("[EDSM] Failed to initialize disk cache:", error);
});

/**
 * Search for systems by partial name, for autocomplete.
 * 
 * Calls the EDSM /systems endpoint and returns a list of matching systems
 * with coordinates and, where available, allegiance and government.
 * 
 * Results are cached in memory with a TTL (15 minutes) to reduce API calls
 * for common autocomplete queries.
 * 
 * @param query - Partial system name to search for (minimum 2 characters)
 * @returns Array of matching systems with coordinates
 */
export async function searchSystems(query: string): Promise<EDSMSystem[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = query.toLowerCase();
  const now = Date.now();

  // Check cache first (with TTL validation)
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // If expired, remove from cache
  if (cached) {
    searchCache.delete(cacheKey);
  }

  try {
    const response = await fetchWithTimeout(
      `${EDSM_API_BASE}/systems?systemName=${encodeURIComponent(
        query
      )}&showCoordinates=1`
    );

    if (!response.ok) {
      // For non-200 responses, return empty array (graceful degradation)
      console.warn(
        `[EDSM] Search API returned ${response.status} for query: ${query}`
      );
      return [];
    }

    const data = await response.json();

    // EDSM returns an array of systems
    const systems: EDSMSystem[] = Array.isArray(data)
      ? data
          .map((item: any) => {
            // Normalize each search result
            if (!item.coords) {
              return null;
            }
            return {
              name: item.name || item.systemName || query,
              coords: {
                x: item.coords.x ?? 0,
                y: item.coords.y ?? 0,
                z: item.coords.z ?? 0,
              },
              allegiance: item.allegiance,
              government: item.government,
            };
          })
          .filter((system): system is EDSMSystem => system !== null)
      : [];

    // Cache the results with TTL
    searchCache.set(cacheKey, {
      data: systems,
      expiresAt: now + SEARCH_CACHE_TTL_MS,
    });

    return systems;
  } catch (error) {
    console.error(`[EDSM] Error fetching system search results for "${query}":`, error);
    // Return empty array on error (graceful degradation)
    return [];
  }
}

/**
 * Resolve a single system by exact name (case-insensitive),
 * including coordinates and, if present, allegiance/government.
 * 
 * Uses caching to avoid repeated calls to EDSM:
 * - First checks in-memory cache (no TTL, persists for process lifetime)
 * - Then checks disk-backed cache (loaded on startup)
 * - Finally queries EDSM API if not cached
 * - New results are cached in memory and scheduled for disk write
 * 
 * @param name - Exact system name (case-insensitive)
 * @returns System information or null if not found
 */
export async function getSystem(name: string): Promise<EDSMSystem | null> {
  if (!name) {
    return null;
  }

  // Normalize name for cache key
  const cacheKey = normalizeSystemName(name);

  // Check in-memory cache first
  if (systemCache.has(cacheKey)) {
    return systemCache.get(cacheKey)!;
  }

  try {
    const response = await fetchWithTimeout(
      `${EDSM_API_BASE}/system?systemName=${encodeURIComponent(
        name
      )}&showCoordinates=1&showInformation=1`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // System not found - log for debugging
        console.warn(`[EDSM] System "${name}" not found (404)`);
        return null;
      }
      throw new Error(`EDSM API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log response for debugging
    console.log(`[EDSM] Response for "${name}":`, {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      hasCoords: !!(data?.coords || data?.coordinates),
    });

    const system = normalizeEDSMResponse(data, name);

    if (!system) {
      // Invalid response - log for debugging
      console.warn(`[EDSM] Failed to normalize system data for "${name}"`, data);
      return null;
    }

    // Store in in-memory cache
    systemCache.set(cacheKey, system);

    // Schedule debounced disk write
    scheduleDiskWrite();

    return system;
  } catch (error) {
    console.error(`[EDSM] Error fetching system info for "${name}":`, error);
    // Return null on error (graceful degradation)
    return null;
  }
}
