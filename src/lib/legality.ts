import type { RareGood } from "../types/rares";
import type { EDSMSystem } from "../types/edsm";

/**
 * Standard Elite Dangerous government types.
 * Based on Inara and game data.
 * 
 * Note: "Prison Colony" is the standard government type for systems controlled by prison colony factions.
 * "Prison" is a special government type for Detention Centres (facilities, not full systems),
 * but included here for completeness in case EDSM returns it or Inara references it.
 */
export const ALL_GOVERNMENT_TYPES = [
  "Anarchy",
  "Communism",
  "Confederacy",
  "Cooperative",
  "Corporate",
  "Democracy",
  "Dictatorship",
  "Feudal",
  "Patronage",
  "Prison",
  "Prison Colony",
  "Theocracy",
] as const;

/**
 * Result of legality evaluation for a rare good in a system.
 */
export interface LegalityResult {
  legal: boolean;
  reason: string;
  details?: LegalityDetails;
}

/**
 * Detailed legality information explaining which governments allow/disallow the item.
 */
export interface LegalityDetails {
  superpowerRestrictions: string[];
  illegalGovernments: string[];
  combinedRestrictions: Array<{ superpower: string; government: string }>;
  legalGovernments: string[];
  explanation: string;
}

/**
 * Generates detailed legality explanation for a rare good.
 * 
 * @param rare - The rare good to analyze
 * @returns Detailed legality information
 */
export function getLegalityDetails(rare: RareGood): LegalityDetails {
  const illegalGovs = rare.illegalInGovs;
  const combinedRestrictions = rare.illegalInSuperpowerGovs || [];
  const legalGovs = ALL_GOVERNMENT_TYPES.filter(
    (gov) => !illegalGovs.includes(gov)
  );

  let explanation = "";
  
  if (rare.illegalInSuperpowers.length > 0) {
    explanation += `Illegal in ${rare.illegalInSuperpowers.join(", ")} space (all government types). `;
  }
  
  if (illegalGovs.length > 0) {
    explanation += `Illegal in ${illegalGovs.length === 1 ? "this government type" : "these government types"} (all superpowers): ${illegalGovs.join(", ")}. `;
  }
  
  if (combinedRestrictions.length > 0) {
    const combinedStrings = combinedRestrictions.map(
      (r) => `${r.superpower} ${r.government}`
    );
    explanation += `Illegal in ${combinedRestrictions.length === 1 ? "this combination" : "these combinations"}: ${combinedStrings.join(", ")}. `;
  }
  
  if (rare.illegalInSuperpowers.length === 0 && illegalGovs.length === 0 && combinedRestrictions.length === 0) {
    explanation = "Legal in all systems and government types";
  } else if (explanation.endsWith(". ")) {
    // Remove trailing space and add summary
    explanation = explanation.trimEnd();
    if (legalGovs.length > 0) {
      explanation += ` Legal in all other combinations.`;
    }
  }

  return {
    superpowerRestrictions: rare.illegalInSuperpowers,
    illegalGovernments: illegalGovs,
    combinedRestrictions,
    legalGovernments: legalGovs,
    explanation,
  };
}

/**
 * Evaluates whether a rare good is legal in a given system.
 * 
 * Checks three conditions (in order of specificity):
 * 1. Combined superpower + government restrictions (most specific)
 * 2. Government type restrictions (applies to all superpowers)
 * 3. Superpower restrictions (applies to all government types in that superpower)
 * 
 * @param rare - The rare good to evaluate
 * @param system - The system to check legality in
 * @returns LegalityResult with legal status and human-readable reason
 */
export function evaluateLegality(rare: RareGood, system: EDSMSystem): LegalityResult {
  // If system info is incomplete, default to legal with a note
  if (!system.allegiance && !system.government) {
    const details = getLegalityDetails(rare);
    return {
      legal: true,
      reason: "System information incomplete; assuming legal",
      details,
    };
  }

  // Check combined superpower + government restrictions first (most specific)
  if (rare.illegalInSuperpowerGovs && rare.illegalInSuperpowerGovs.length > 0) {
    if (system.allegiance && system.government) {
      const matchesCombined = rare.illegalInSuperpowerGovs.some(
        (restriction) =>
          restriction.superpower === system.allegiance &&
          restriction.government === system.government
      );
      if (matchesCombined) {
        const details = getLegalityDetails(rare);
        return {
          legal: false,
          reason: `Illegal in ${system.allegiance} ${system.government} systems`,
          details,
        };
      }
    }
  }

  // Check government restrictions (applies regardless of superpower)
  if (rare.illegalInGovs.length > 0 && system.government) {
    if (rare.illegalInGovs.includes(system.government)) {
      const details = getLegalityDetails(rare);
      return {
        legal: false,
        reason: `Illegal in ${system.government} governments`,
        details,
      };
    }
  }

  // Check superpower restrictions (applies to all government types in that superpower)
  if (rare.illegalInSuperpowers.length > 0 && system.allegiance) {
    if (rare.illegalInSuperpowers.includes(system.allegiance)) {
      const details = getLegalityDetails(rare);
      return {
        legal: false,
        reason: `Illegal in ${system.allegiance} systems`,
        details,
      };
    }
  }

  const details = getLegalityDetails(rare);
  return {
    legal: true,
    reason: "Legal",
    details,
  };
}
