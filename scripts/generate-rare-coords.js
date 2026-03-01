/**
 * Generate rare-system-coords.json from EDSM API.
 * Fetches coordinates for all unique rare commodity origin systems.
 *
 * Usage: node scripts/generate-rare-coords.js
 *
 * Reads: src/data/rares.ts (derives unique system names from system: field)
 * Output: data/rare-system-coords.json (or .config.json dataDir if present)
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const EDSM_API = "https://www.edsm.net/api-v1/system";
const DELAY_MS = 500; // Rate limit: ~2 requests/sec

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchCoords(systemName) {
  const url = `${EDSM_API}?systemName=${encodeURIComponent(systemName)}&showCoordinates=1`;
  const res = await fetch(url);
  const data = await res.json();

  const x = data?.coords?.x ?? data?.x;
  const y = data?.coords?.y ?? data?.y;
  const z = data?.coords?.z ?? data?.z;

  if (x !== undefined && y !== undefined && z !== undefined) {
    return { x: Number(x), y: Number(y), z: Number(z) };
  }
  return null;
}

/**
 * Extract unique system names from rares.ts (matches system: 'X' or system: "X"; handles apostrophes).
 */
function extractSystemsFromRares(content) {
  const seen = new Set();
  const reDouble = /system:\s*"([^"]+)"/g;
  const reSingle = /system:\s*'([^']+)'/g;
  let m;
  while ((m = reDouble.exec(content)) !== null) seen.add(m[1]);
  while ((m = reSingle.exec(content)) !== null) seen.add(m[1]);
  return [...seen].sort();
}

function getDataDir() {
  try {
    const configPath = join(process.cwd(), ".config.json");
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      if (config.dataDir && typeof config.dataDir === "string") {
        return config.dataDir;
      }
    }
  } catch {
    // ignore
  }
  return join(process.cwd(), "data");
}

async function main() {
  const commoditiesPath = join(ROOT, "src/data/rares.ts");
  const content = await readFile(commoditiesPath, "utf-8");
  const systems = extractSystemsFromRares(content);
  console.log(`[generate-rare-coords] Fetching coords for ${systems.length} systems...`);

  const coords = {};
  let ok = 0;
  let fail = 0;

  for (const system of systems) {
    await sleep(DELAY_MS);
    try {
      const c = await fetchCoords(system);
      if (c) {
        coords[system] = c;
        ok++;
      } else {
        console.warn(`  No coords for: ${system}`);
        fail++;
      }
    } catch (err) {
      console.warn(`  Error for ${system}:`, err.message);
      fail++;
    }
  }

  const dataDir = getDataDir();
  await mkdir(dataDir, { recursive: true });
  const outputPath = join(dataDir, "rare-system-coords.json");
  await writeFile(outputPath, JSON.stringify(coords, null, 2), "utf-8");

  console.log(`[generate-rare-coords] Done. OK: ${ok}, Fail: ${fail}`);
  console.log(`[generate-rare-coords] Wrote ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
