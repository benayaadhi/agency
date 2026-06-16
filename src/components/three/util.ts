import { GRID_W, GRID_H } from "@/game/office";

/**
 * Maps the 2D logic grid (used by the motion system in store.ts) into the
 * 3D world. One grid unit = one world unit. The office is centered on the
 * origin so the camera/orbit feels balanced.
 *   grid x → world x   ·   grid y → world z   ·   up is world y
 */
export function gridToWorld(gx: number, gy: number, y = 0): [number, number, number] {
  return [gx - GRID_W / 2, y, gy - GRID_H / 2];
}

export const OFFSET_X = GRID_W / 2;
export const OFFSET_Z = GRID_H / 2;
