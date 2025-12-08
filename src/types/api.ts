export type PpSystemType = "acquisition" | "exploit" | "reinforcement" | "none";

export interface ScanRequest {
  current: string;
  currentPpType: PpSystemType;
  power: string;
  hasFinanceEthos: boolean;
}

export interface ScanResult {
  rare: string;
  originSystem: string;
  originStation: string;
  pad?: string;
  sellHintLy?: number;
  distanceToStarLs?: number;
  cost?: number;
  permitRequired?: boolean;
  distanceFromCurrentLy: number;
  systemNotFound?: boolean; // True if origin system coordinates couldn't be found
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
