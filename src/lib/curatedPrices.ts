import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { RareGood } from "../types/rares";

/**
 * Curated price data structure.
 * This data overrides the base data in rares.ts when present.
 */
export interface CuratedPriceData {
  [rareName: string]: {
    cost?: number; // Baseline purchase price in credits
  };
}

const CURATED_DATA_PATH = join(process.cwd(), "data", "curatedPrices.json");

/**
 * Load curated price data from disk.
 */
export async function loadCuratedPrices(): Promise<CuratedPriceData> {
  try {
    if (!existsSync(CURATED_DATA_PATH)) {
      return {};
    }
    const content = await readFile(CURATED_DATA_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("[curatedPrices] Error loading curated data:", error);
    return {};
  }
}

/**
 * Save curated price data to disk.
 */
export async function saveCuratedPrices(
  data: CuratedPriceData
): Promise<void> {
  try {
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(CURATED_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[curatedPrices] Error saving curated data:", error);
    throw error;
  }
}

/**
 * Apply curated price data to a rare good.
 * Curated data overrides base data when present.
 */
export function applyCuratedPrices(
  rare: RareGood,
  curated: CuratedPriceData
): RareGood {
  const curatedData = curated[rare.rare];
  if (!curatedData) {
    return rare;
  }

  return {
    ...rare,
    cost: curatedData.cost ?? rare.cost,
  };
}

/**
 * Get all rare goods with curated price data applied.
 */
export function getRaresWithCuratedPrices(
  rares: RareGood[],
  curated: CuratedPriceData
): RareGood[] {
  return rares.map((rare) => applyCuratedPrices(rare, curated));
}

/**
 * Get curated price for a specific rare good.
 */
export function getCuratedPrice(
  rareName: string,
  curated: CuratedPriceData
): number | undefined {
  return curated[rareName]?.cost;
}
