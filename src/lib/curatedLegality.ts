import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { RareGood } from "../types/rares";

/**
 * Curated legality data structure.
 * This data overrides the base data in rares.ts when present.
 */
export interface CuratedLegalityData {
  [rareName: string]: {
    illegalInSuperpowers?: string[];
    illegalInGovs?: string[];
    illegalInSuperpowerGovs?: Array<{ superpower: string; government: string }>;
  };
}

const CURATED_DATA_PATH = join(process.cwd(), "data", "curatedLegality.json");

/**
 * Load curated legality data from disk.
 */
export async function loadCuratedLegality(): Promise<CuratedLegalityData> {
  try {
    if (!existsSync(CURATED_DATA_PATH)) {
      return {};
    }
    const content = await readFile(CURATED_DATA_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("[curatedLegality] Error loading curated data:", error);
    return {};
  }
}

/**
 * Save curated legality data to disk.
 */
export async function saveCuratedLegality(
  data: CuratedLegalityData
): Promise<void> {
  try {
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(CURATED_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[curatedLegality] Error saving curated data:", error);
    throw error;
  }
}

/**
 * Apply curated legality data to a rare good.
 * Curated data overrides base data when present.
 */
export function applyCuratedLegality(
  rare: RareGood,
  curated: CuratedLegalityData
): RareGood {
  const curatedData = curated[rare.rare];
  if (!curatedData) {
    return rare;
  }

  return {
    ...rare,
    illegalInSuperpowers:
      curatedData.illegalInSuperpowers ?? rare.illegalInSuperpowers,
    illegalInGovs: curatedData.illegalInGovs ?? rare.illegalInGovs,
    illegalInSuperpowerGovs:
      curatedData.illegalInSuperpowerGovs ?? rare.illegalInSuperpowerGovs,
  };
}

/**
 * Get all rare goods with curated data applied.
 */
export function getRaresWithCuratedData(
  rares: RareGood[],
  curated: CuratedLegalityData
): RareGood[] {
  return rares.map((rare) => applyCuratedLegality(rare, curated));
}
