export type PpSystemType = "acquisition" | "exploit" | "reinforcement" | "none";

export interface ScanRequest {
  current: string;
  currentPpType: PpSystemType;
  power: string;
  hasFinanceEthos: boolean;
}

/** See src/lib/legality.ts getLegalityDetails() for how each field is derived. */
export interface LegalityDetails {
  superpowerRestrictions: string[];
  illegalGovernments: string[];
  combinedRestrictions: Array<{ superpower: string; government: string }>;
  legalGovernments: string[];
  explanation: string;
}

/**
 * One rare good's result for a scan, as returned by POST /api/rares-scan.
 *
 * `distanceFromCurrentLy` is `0` both when the current system genuinely IS the
 * rare's origin (closest possible result) and when the origin's coordinates
 * couldn't be resolved (worst case) - `systemNotFound` is what disambiguates
 * the two; don't infer "not found" from the distance being `0` alone.
 */
export interface ScanResult {
  rare: string;
  originSystem: string;
  originStation: string;
  pad?: string;
  sellHintLy?: number;
  distanceToStarLs?: number;
  cost?: number; // Static baseline price from rares.ts
  permitRequired?: boolean;
  distanceFromCurrentLy: number;
  systemNotFound?: boolean; // True if origin system coordinates couldn't be found
  legal: boolean;
  legalReason: string;
  legalityDetails?: LegalityDetails;
  ppEligible: boolean;
  cpDivisors: CpDivisors | null;
}

/** See src/lib/powerplay.ts cpDivisors() for how these are calculated. */
export interface CpDivisors {
  divisor: number;
  divisorWithFinanceEthos: number;
  effective: number;
}
