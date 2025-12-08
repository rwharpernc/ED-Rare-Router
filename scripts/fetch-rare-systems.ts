import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { rares } from "../src/data/rares";

const EDSM_API_BASE = "https://www.edsm.net/api-v1";
const OUTPUT_FILE = join(process.cwd(), "data", "rareSystemsCache.json");
const FETCH_TIMEOUT_MS = 10000;

interface EDSMSystem {
  name: string;
  coords: {
    x: number;
    y: number;
    z: number;
  };
  allegiance?: string;
  government?: string;
}

interface RareSystemCache {
  [systemName: string]: EDSMSystem;
  _metadata?: {
    lastUpdated: string;
    totalSystems: number;
  };
}

/**
 * Fetch system data from EDSM API with timeout
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
        "User-Agent": "ED-Rare-Router/1.0 (system data fetcher)",
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
 * Normalize EDSM API response to our system format
 */
function normalizeEDSMResponse(
  data: any,
  fallbackName: string
): EDSMSystem | null {
  const coords = data?.coords || data?.coordinates;

  if (!data || !coords) {
    return null;
  }

  return {
    name: data.name || data.systemName || fallbackName,
    coords: {
      x: coords.x ?? coords.xCoord ?? 0,
      y: coords.y ?? coords.yCoord ?? 0,
      z: coords.z ?? coords.zCoord ?? 0,
    },
    allegiance: data.information?.allegiance || data.allegiance,
    government: data.information?.government || data.government,
  };
}

/**
 * Fetch a single system from EDSM
 */
async function fetchSystem(name: string): Promise<EDSMSystem | null> {
  try {
    console.log(`Fetching system: ${name}...`);
    const response = await fetchWithTimeout(
      `${EDSM_API_BASE}/system?systemName=${encodeURIComponent(
        name
      )}&showCoordinates=1&showInformation=1`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`  ⚠ System "${name}" not found (404)`);
        return null;
      }
      throw new Error(`EDSM API error: ${response.statusText}`);
    }

    const data = await response.json();
    const system = normalizeEDSMResponse(data, name);

    if (!system) {
      console.warn(`  ⚠ Failed to normalize system data for "${name}"`);
      return null;
    }

    console.log(`  ✓ Found: ${system.name} at (${system.coords.x}, ${system.coords.y}, ${system.coords.z})`);
    return system;
  } catch (error) {
    console.error(`  ✗ Error fetching "${name}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Main function to fetch all rare origin systems
 */
async function main() {
  console.log("Fetching rare origin system data from EDSM...\n");

  // Get unique system names from rares
  const uniqueSystems = Array.from(new Set(rares.map((r) => r.system)));
  console.log(`Found ${uniqueSystems.length} unique systems to fetch\n`);

  // Ensure data directory exists
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  // Load existing cache if it exists
  let existingCache: RareSystemCache = {};
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing = await readFile(OUTPUT_FILE, "utf-8");
      existingCache = JSON.parse(existing);
      console.log(`Loaded ${Object.keys(existingCache).filter(k => !k.startsWith('_')).length} systems from existing cache\n`);
    } catch (error) {
      console.warn("Could not load existing cache, starting fresh");
    }
  }

  const cache: RareSystemCache = { ...existingCache };
  const results = {
    found: 0,
    notFound: 0,
    errors: 0,
    cached: 0,
  };

  // Fetch each system (with rate limiting)
  for (let i = 0; i < uniqueSystems.length; i++) {
    const systemName = uniqueSystems[i];
    const cacheKey = systemName.toLowerCase();

    // Skip if already in cache and has valid coords
    if (cache[cacheKey]?.coords) {
      console.log(`[${i + 1}/${uniqueSystems.length}] Using cached: ${systemName}`);
      results.cached++;
      continue;
    }

    // Fetch from API
    const system = await fetchSystem(systemName);

    if (system) {
      cache[cacheKey] = system;
      results.found++;
    } else {
      results.notFound++;
      // Keep existing cache entry if it exists, otherwise mark as not found
      if (!cache[cacheKey]) {
        cache[cacheKey] = {
          name: systemName,
          coords: { x: 0, y: 0, z: 0 },
        };
      }
    }

    // Rate limiting: wait 200ms between requests to be polite to EDSM
    if (i < uniqueSystems.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Add metadata
  cache._metadata = {
    lastUpdated: new Date().toISOString(),
    totalSystems: uniqueSystems.length,
  };

  // Write cache to file
  await writeFile(OUTPUT_FILE, JSON.stringify(cache, null, 2), "utf-8");

  console.log("\n" + "=".repeat(50));
  console.log("Fetch complete!");
  console.log(`  ✓ Found: ${results.found}`);
  console.log(`  ⚠ Not found: ${results.notFound}`);
  console.log(`  📦 Cached: ${results.cached}`);
  console.log(`  📄 Saved to: ${OUTPUT_FILE}`);
  console.log("=".repeat(50));
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
