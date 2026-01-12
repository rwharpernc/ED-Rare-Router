export type PadSize = "S" | "M" | "L";

/**
 * Combined superpower + government restriction.
 * Used for cases like "Federal Democracy" where both conditions must be met.
 */
export interface SuperpowerGovRestriction {
  superpower: string;
  government: string;
}

/**
 * Rare Good data structure for route planning.
 * 
 * All data is static - rare commodities are always found in the same places.
 * Focus is on: location, price, legality, and distance for route building.
 */
export interface RareGood {
  /** Name of the rare commodity */
  rare: string;
  /** Origin system name (verified in EDSM) */
  system: string;
  /** Origin station name */
  station: string;
  /** Landing pad size required */
  pad: PadSize;
  /** Optimal selling distance in lightyears for maximum profit */
  sellHintLy: number;
  /** Superpowers where this rare is illegal (applies to all government types in that superpower) */
  illegalInSuperpowers: string[];
  /** Government types where this rare is illegal (applies regardless of superpower) */
  illegalInGovs: string[];
  /** Combined superpower + government restrictions (e.g., "Federal Democracy" = Federation + Democracy) */
  illegalInSuperpowerGovs?: SuperpowerGovRestriction[];
  /** Distance from arrival star to station in light seconds */
  distanceToStarLs?: number;
  /** Typical market cost in credits (static baseline price) */
  cost?: number;
  /** Whether the system requires a permit */
  permitRequired?: boolean;
  /** PowerPlay eligibility and notes */
  pp: {
    /** System types where this rare can generate CP */
    eligibleSystemTypes: Array<"acquisition" | "exploit">;
    /** Optional notes (e.g., engineer requirements) */
    notes?: string;
  };
}
