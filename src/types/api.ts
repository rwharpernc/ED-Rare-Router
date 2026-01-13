export type PpSystemType = "acquisition" | "exploit" | "reinforcement" | "none";

export interface ScanRequest {
  current: string;
  currentPpType: PpSystemType;
  power: string;
  hasFinanceEthos: boolean;
}

export interface LegalityDetails {
  superpowerRestrictions: string[];
  illegalGovernments: string[];
  combinedRestrictions: Array<{ superpower: string; government: string }>;
  legalGovernments: string[];
  explanation: string;
}

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
  // Real-time market data from EDDN
  marketData?: {
    buyPrice: number;
    sellPrice: number;
    stock: number;
    stockBracket: number;
    timestamp: string;
  };
}

export interface CpDivisors {
  divisor: number;
  divisorWithFinanceEthos: number;
  effective: number;
}
