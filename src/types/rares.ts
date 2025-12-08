export type PadSize = "S" | "M" | "L";

export interface RareGood {
  rare: string;
  system: string;
  station: string;
  pad: PadSize;
  sellHintLy: number;
  illegalInSuperpowers: string[];
  illegalInGovs: string[];
  /** Distance from arrival star to station in light seconds, if known */
  distanceToStarLs?: number;
  /** Typical allocation cap for the commodity, if known */
  allocation?: number;
  /** Typical market cost in credits, if known */
  cost?: number;
  /** Whether the system requires a permit */
  permitRequired?: boolean;
  /** Recent reported system or station state (e.g., Boom, Expansion) */
  stationState?: string;
  pp: {
    eligibleSystemTypes: Array<"acquisition" | "exploit">;
    notes?: string;
  };
}
