export type PadSize = "S" | "M" | "L";

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
  /** Superpowers where this rare is illegal */
  illegalInSuperpowers: string[];
  /** Government types where this rare is illegal */
  illegalInGovs: string[];
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
