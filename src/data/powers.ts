/**
 * Elite Dangerous PowerPlay Power with faction information
 */
export interface PowerPlayPower {
  name: string;
  faction: "Federation" | "Alliance" | "Empire" | "Independent";
}

/**
 * Elite Dangerous PowerPlay Powers
 * 
 * Complete list of all PowerPlay powers as of current game state.
 * Data sourced from Inara.cz Elite Dangerous PowerPlay listing.
 * 
 * Powers are listed in alphabetical order for easy reference.
 */
export const powerplayPowers: PowerPlayPower[] = [
  { name: "Aisling Duval", faction: "Empire" },
  { name: "Archon Delaine", faction: "Independent" },
  { name: "Arissa Lavigny-Duval", faction: "Empire" },
  { name: "Denton Patreus", faction: "Empire" },
  { name: "Edmund Mahon", faction: "Alliance" },
  { name: "Felicia Winters", faction: "Federation" },
  { name: "Jerome Archer", faction: "Federation" },
  { name: "Li Yong-Rui", faction: "Independent" },
  { name: "Nakato Kaine", faction: "Alliance" },
  { name: "Pranav Antal", faction: "Independent" },
  { name: "Yuri Grom", faction: "Independent" },
  { name: "Zemina Torval", faction: "Empire" },
];

/**
 * Search for powers matching a query string (case-insensitive, fuzzy).
 * 
 * Matching strategy (in priority order):
 * 1. Exact matches (case-insensitive) - highest priority
 * 2. Powers that start with the query - high priority
 * 3. Powers where any word starts with the query - medium-high priority
 * 4. Powers that contain the query anywhere - lower priority
 * 
 * This ensures that when typing "Arc", you'll only see:
 * - "Archon Delaine" (starts with "Arc")
 * - "Jerome Archer" (word "Archer" starts with "Arc")
 * 
 * Powers like "Arissa Lavigny-Duval" won't show because they don't start with "Arc"
 * and no word starts with "Arc".
 * 
 * @param query - Search query (can be partial)
 * @returns Array of matching power objects, sorted by relevance
 */
export function searchPowers(query: string): PowerPlayPower[] {
  if (!query || query.trim().length === 0) {
    return powerplayPowers;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Score each power based on match quality
  const scoredPowers = powerplayPowers.map((power) => {
    const lowerPower = power.name.toLowerCase();
    let score = 0;

    // 1. Exact match - highest priority
    if (lowerPower === normalizedQuery) {
      score = 1000;
    }
    // 2. Starts with query - high priority
    else if (lowerPower.startsWith(normalizedQuery)) {
      score = 500;
    }
    // 3. Any word starts with the query - medium-high priority
    else {
      const words = lowerPower.split(/\s+/);
      const wordStartsWith = words.some((word) =>
        word.startsWith(normalizedQuery)
      );
      if (wordStartsWith) {
        score = 150;
      }
      // 4. Contains query anywhere - lower priority (only if no word match)
      else if (lowerPower.includes(normalizedQuery)) {
        score = 100;
      }
    }

    return { power, score };
  });

  // Filter out non-matches (score > 0) and sort by score (descending)
  return scoredPowers
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.power);
}

/**
 * Get a power by name (case-insensitive)
 * 
 * @param name - Power name to look up
 * @returns Power object or undefined if not found
 */
export function getPowerByName(name: string): PowerPlayPower | undefined {
  const normalizedName = name.toLowerCase().trim();
  return powerplayPowers.find(
    (power) => power.name.toLowerCase() === normalizedName
  );
}
