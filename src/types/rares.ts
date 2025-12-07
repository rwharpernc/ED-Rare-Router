export type PadSize = "S" | "M" | "L";

export interface RareGood {
  rare: string;
  system: string;
  station: string;
  pad: PadSize;
  sellHintLy: number;
  illegalInSuperpowers: string[];
  illegalInGovs: string[];
  pp: {
    eligibleSystemTypes: Array<"acquisition" | "exploit">;
    notes?: string;
  };
}
