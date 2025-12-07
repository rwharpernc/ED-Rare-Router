/**
 * Fuzzy search utilities for system names and other text matching.
 * 
 * Provides fuzzy matching algorithms to improve search results,
 * especially useful for handling typos and partial matches.
 */

/**
 * Calculate Levenshtein distance between two strings.
 * 
 * Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one word into another.
 * 
 * @param a - First string
 * @param b - Second string
 * @returns Distance (0 = identical, higher = more different)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate a fuzzy match score between a query and a target string.
 * 
 * Returns a score from 0-1 where:
 * - 1.0 = exact match
 * - Higher scores = better matches
 * - Lower scores = worse matches
 * 
 * @param query - Search query
 * @param target - String to match against
 * @returns Score between 0 and 1
 */
function fuzzyScore(query: string, target: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  // Exact match gets perfect score
  if (normalizedQuery === normalizedTarget) {
    return 1.0;
  }

  // Starts with query gets very high score
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return 0.9;
  }

  // Contains query gets high score
  if (normalizedTarget.includes(normalizedQuery)) {
    return 0.7;
  }

  // Word starts with query gets medium-high score
  const words = normalizedTarget.split(/\s+/);
  const wordStartsWith = words.some((word) =>
    word.startsWith(normalizedQuery)
  );
  if (wordStartsWith) {
    return 0.6;
  }

  // Calculate Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);

  if (maxLength === 0) {
    return 0;
  }

  // Convert distance to similarity score
  // Closer to 0 distance = higher score
  const similarity = 1 - distance / maxLength;

  // Only return positive scores for reasonable matches
  // Require at least 50% similarity for fuzzy matches
  if (similarity < 0.5) {
    return 0;
  }

  // Scale fuzzy matches to 0.1-0.5 range
  return similarity * 0.5;
}

/**
 * Fuzzy search interface for items with a name property
 */
export interface FuzzySearchable {
  name: string;
  [key: string]: any;
}

/**
 * Perform fuzzy search on an array of items.
 * 
 * Sorts results by relevance score (highest first).
 * 
 * @param query - Search query
 * @param items - Array of items to search
 * @param minScore - Minimum score threshold (default: 0.1)
 * @returns Sorted array of matching items with scores
 */
export function fuzzySearch<T extends FuzzySearchable>(
  query: string,
  items: T[],
  minScore: number = 0.1
): Array<{ item: T; score: number }> {
  if (!query || query.trim().length === 0) {
    return items.map((item) => ({ item, score: 1.0 }));
  }

  const scored = items.map((item) => ({
    item,
    score: fuzzyScore(query, item.name),
  }));

  return scored
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

/**
 * Simple fuzzy match check (returns boolean).
 * 
 * Useful for quick filtering without scoring.
 * 
 * @param query - Search query
 * @param target - String to match against
 * @param threshold - Minimum similarity threshold (default: 0.5)
 * @returns True if match score exceeds threshold
 */
export function fuzzyMatch(
  query: string,
  target: string,
  threshold: number = 0.5
): boolean {
  return fuzzyScore(query, target) >= threshold;
}

