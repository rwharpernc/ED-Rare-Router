export interface EDSMCoords {
  x: number;
  y: number;
  z: number;
}

export interface EDSMSystem {
  name: string;
  coords: EDSMCoords;
  allegiance?: string;
  government?: string;
}
