import type { RareGood } from "../types/rares";
import type { PpSystemType, CpDivisors } from "../types/api";

/**
 * Returns true if a rare can generate CP in the given PP system type.
 * 
 * According to PowerPlay 2.0 rules, rare goods count as profit-based trade
 * in acquisition and exploit systems only.
 * 
 * @param rare - The rare good to check
 * @param systemType - The PowerPlay system type
 * @returns true if the rare is eligible for CP generation in this system type
 */
export function ppEligibleForSystemType(
  rare: RareGood,
  systemType: PpSystemType
): boolean {
  // Only acquisition and exploit systems allow profit-based CP from rare goods
  if (systemType !== "acquisition" && systemType !== "exploit") {
    return false;
  }

  return rare.pp.eligibleSystemTypes.includes(systemType);
}

/**
 * Returns applicable CP divisors given whether the commander has a finance ethos bonus.
 * 
 * PowerPlay 2.0 CP formula:
 * - Base divisor: 5333
 * - With finance ethos: 3555
 * 
 * @param hasFinanceEthos - Whether the commander has finance ethos bonus
 * @returns CpDivisors object with base, finance ethos, and effective divisors
 */
export function cpDivisors(hasFinanceEthos: boolean): CpDivisors {
  const baseDivisor = 5333;
  const financeEthosDivisor = 3555;

  return {
    divisor: baseDivisor,
    divisorWithFinanceEthos: financeEthosDivisor,
    effective: hasFinanceEthos ? financeEthosDivisor : baseDivisor,
  };
}
