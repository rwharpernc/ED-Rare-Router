export type PpSystemType = "acquisition" | "exploit" | "reinforcement" | "none";

export interface ScanRequest {
  current: string;
  currentPpType: PpSystemType;
  power: string;
  hasFinanceEthos: boolean;
}

export interface AnalyzeRequest {
  current: string;
  target: string;
  targetPpType: PpSystemType;
  power: string;
  hasFinanceEthos: boolean;
}

export interface ScanResult {
  rare: string;
  originSystem: string;
  originStation: string;
  distanceFromCurrentLy: number;
  legal: boolean;
  legalReason: string;
  ppEligible: boolean;
  cpDivisors: CpDivisors | null;
}

export interface AnalyzeResult {
  rare: string;
  originSystem: string;
  originStation: string;
  distanceCurrentToOriginLy: number;
  distanceOriginToTargetLy: number;
  inProfitRange: boolean;
  legal: boolean;
  legalReason: string;
  ppEligible: boolean;
  cpDivisors: CpDivisors | null;
}

export interface CpDivisors {
  divisor: number;
  divisorWithFinanceEthos: number;
  effective: number;
}
