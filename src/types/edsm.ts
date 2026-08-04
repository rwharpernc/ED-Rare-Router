export interface EDSMCoords {
  x: number;
  y: number;
  z: number;
}

/**
 * A system as resolved from EDSM (or the rare-systems cache).
 *
 * `allegiance` and `government` are optional because EDSM doesn't always have
 * them for every system (e.g. unpopulated/unexplored ones). When both are
 * missing, src/lib/legality.ts treats the rare as legal by default rather than
 * blocking on incomplete data - see evaluateLegality().
 */
export interface EDSMSystem {
  name: string;
  coords: EDSMCoords;
  allegiance?: string;
  government?: string;
}
