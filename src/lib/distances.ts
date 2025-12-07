import type { EDSMCoords } from "../types/edsm";

/**
 * Compute straight-line distance in lightyears using 3D coordinates.
 * 
 * Uses the standard Euclidean distance formula in 3D space:
 * distance = sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)
 * 
 * @param a - First set of coordinates
 * @param b - Second set of coordinates
 * @returns Distance in lightyears
 */
export function lyDistance(a: EDSMCoords, b: EDSMCoords): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
