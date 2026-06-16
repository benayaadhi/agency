/** Isometric projection helpers (2:1 diamond tiles). */

export const TILE_W = 64;
export const TILE_H = 32;

export interface Point {
  x: number;
  y: number;
}

/** Convert grid coordinates (can be fractional) to screen pixels. */
export function isoToScreen(gx: number, gy: number): Point {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2),
  };
}

/** Depth value for painter's-algorithm z-ordering. Higher = nearer the viewer. */
export function depth(gx: number, gy: number): number {
  return gx + gy;
}

/** Euclidean distance between two grid points. */
export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Move `from` toward `to` by at most `max` units; returns the new point. */
export function stepToward(from: Point, to: Point, max: number): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy);
  if (d <= max || d === 0) return { x: to.x, y: to.y };
  return { x: from.x + (dx / d) * max, y: from.y + (dy / d) * max };
}
