import type { RareGood } from "../types/rares";
import type { EDSMSystem } from "../types/edsm";

/**
 * Result of legality evaluation for a rare good in a system.
 */
export interface LegalityResult {
  legal: boolean;
  reason: string;
}

/**
 * Evaluates whether a rare good is legal in a given system.
 * 
 * Checks two conditions:
 * 1. If the rare is illegal in the system's superpower (allegiance)
 * 2. If the rare is illegal in the system's government type
 * 
 * @param rare - The rare good to evaluate
 * @param system - The system to check legality in
 * @returns LegalityResult with legal status and human-readable reason
 */
export function evaluateLegality(rare: RareGood, system: EDSMSystem): LegalityResult {
  // If system info is incomplete, default to legal with a note
  if (!system.allegiance && !system.government) {
    return {
      legal: true,
      reason: "System information incomplete; assuming legal",
    };
  }

  // Check superpower restrictions
  if (rare.illegalInSuperpowers.length > 0 && system.allegiance) {
    if (rare.illegalInSuperpowers.includes(system.allegiance)) {
      return {
        legal: false,
        reason: `Illegal in ${system.allegiance} systems`,
      };
    }
  }

  // Check government restrictions
  if (rare.illegalInGovs.length > 0 && system.government) {
    if (rare.illegalInGovs.includes(system.government)) {
      return {
        legal: false,
        reason: `Illegal in ${system.government} governments`,
      };
    }
  }

  return {
    legal: true,
    reason: "Legal",
  };
}
