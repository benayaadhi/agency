import type { Point } from "./iso";

/** Static floor-plan of the agency. All coordinates are in grid tiles. */

export const GRID_W = 16;
export const GRID_H = 13;

/** Pixel offset applied to the inner office so all tiles land in positive space. */
export const ORIGIN = { x: 416, y: 44 };
export const OFFICE_W = 928;
export const OFFICE_H = 540;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoomLayout {
  id: string;
  rect: Rect;
  /** Where the agent idles. */
  desk: Point;
  /** Door tile (on the corridor side). */
  door: Point;
}

/** Central table where assigned agents gather to "work". */
export const MEETING: Point = { x: 7.5, y: 8.5 };

export const ROOMS: RoomLayout[] = [
  {
    id: "strategy",
    rect: { x: 0, y: 0, w: 5, h: 5 },
    desk: { x: 2, y: 2 },
    door: { x: 2, y: 5 },
  },
  {
    id: "finance",
    rect: { x: 6, y: 0, w: 4, h: 4 },
    desk: { x: 7.5, y: 1.5 },
    door: { x: 7.5, y: 4 },
  },
  {
    id: "creative",
    rect: { x: 11, y: 0, w: 5, h: 5 },
    desk: { x: 13, y: 2 },
    door: { x: 13, y: 5 },
  },
  {
    id: "social",
    rect: { x: 0, y: 8, w: 5, h: 5 },
    desk: { x: 2, y: 10 },
    door: { x: 2, y: 8 },
  },
  {
    id: "analytics",
    rect: { x: 11, y: 8, w: 5, h: 5 },
    desk: { x: 13, y: 10 },
    door: { x: 13, y: 8 },
  },
];

export const ROOMS_BY_ID: Record<string, RoomLayout> = Object.fromEntries(
  ROOMS.map((r) => [r.id, r]),
);

/** Is a tile inside any room? (used to tint room floors vs. corridor) */
export function roomAt(gx: number, gy: number): RoomLayout | null {
  for (const r of ROOMS) {
    if (
      gx >= r.rect.x &&
      gx < r.rect.x + r.rect.w &&
      gy >= r.rect.y &&
      gy < r.rect.y + r.rect.h
    ) {
      return r;
    }
  }
  return null;
}

/**
 * Waypoints for an agent walking from its desk out to the meeting table.
 * Routes desk → door → a corridor lane → meeting, staying out of walls.
 */
export function pathToMeeting(roomId: string): Point[] {
  const room = ROOMS_BY_ID[roomId];
  if (!room) return [MEETING];
  return [room.door, { x: room.door.x, y: MEETING.y }, MEETING];
}

/** Reverse path: meeting → back to the desk. */
export function pathToDesk(roomId: string): Point[] {
  const room = ROOMS_BY_ID[roomId];
  if (!room) return [];
  return [{ x: room.door.x, y: MEETING.y }, room.door, room.desk];
}
