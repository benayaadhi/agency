"use client";

import { useEffect, useRef, useState } from "react";
import { isoToScreen, TILE_H } from "@/game/iso";
import {
  GRID_W,
  GRID_H,
  MEETING,
  OFFICE_H,
  OFFICE_W,
  ORIGIN,
  ROOMS,
  roomAt,
} from "@/game/office";
import { AGENTS, AGENTS_BY_ID } from "@/agents/registry";
import { useGame } from "@/game/store";
import { Character } from "./Character";

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function Furniture({
  gx,
  gy,
  color,
  big,
}: {
  gx: number;
  gy: number;
  color: string;
  big?: boolean;
}) {
  const s = isoToScreen(gx, gy);
  const z = Math.round((gx + gy) * 10) + 3;
  return (
    <div
      className="furn"
      style={
        {
          left: s.x,
          top: s.y + TILE_H / 2,
          zIndex: z,
          width: big ? 70 : 48,
          height: big ? 34 : 24,
          ["--f" as string]: color,
          ["--fd" as string]: hexToRgba(color, 0.6),
        } as React.CSSProperties
      }
    >
      <div className="top" />
      <div className="side" />
    </div>
  );
}

export function Office() {
  const agents = useGame((s) => s.agents);
  const selectedId = useGame((s) => s.selectedId);
  const selectRoom = useGame((s) => s.selectRoom);

  // Auto-fit scale so the office is fully visible on smaller screens.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const s = Math.min(
        el.clientWidth / (OFFICE_W + 80),
        el.clientHeight / (OFFICE_H + 60),
        1.3,
      );
      setScale(Math.max(0.45, s));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // floor tiles
  const tiles: React.ReactNode[] = [];
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const room = roomAt(gx, gy);
      const s = isoToScreen(gx, gy);
      const checker = (gx + gy) % 2 === 0;
      const z = Math.round((gx + gy) * 10);
      const color = room ? AGENTS_BY_ID[room.id]?.color : null;
      const isSel = room && room.id === selectedId;
      tiles.push(
        <div
          key={`t-${gx}-${gy}`}
          className={`tile ${room ? "room" : ""} ${checker ? "alt" : ""}`}
          onClick={room ? () => selectRoom(room.id) : undefined}
          style={
            {
              left: s.x - 32,
              top: s.y,
              zIndex: z,
              cursor: room ? "pointer" : "default",
              background: color
                ? hexToRgba(color, isSel ? 0.42 : checker ? 0.26 : 0.2)
                : undefined,
            } as React.CSSProperties
          }
        />,
      );
    }
  }

  return (
    <div className="office-wrap" ref={wrapRef}>
      <div
        className="office"
        style={{ width: OFFICE_W, height: OFFICE_H, transform: `scale(${scale})` }}
      >
        <div style={{ position: "absolute", left: ORIGIN.x, top: ORIGIN.y, width: 0, height: 0 }}>
          {tiles}

          {/* meeting rug + table */}
          <div
            className="rug"
            style={{
              left: isoToScreen(MEETING.x, MEETING.y).x,
              top: isoToScreen(MEETING.x, MEETING.y).y + TILE_H / 2,
              zIndex: Math.round((MEETING.x + MEETING.y) * 10) + 1,
            }}
          />
          <Furniture gx={MEETING.x} gy={MEETING.y} color="#5b4b8a" big />

          {/* desks */}
          {ROOMS.map((r) => (
            <Furniture
              key={`d-${r.id}`}
              gx={r.desk.x}
              gy={r.desk.y}
              color={AGENTS_BY_ID[r.id]?.color ?? "#6b5b3e"}
            />
          ))}

          {/* room signs */}
          {ROOMS.map((r) => {
            const a = AGENTS_BY_ID[r.id];
            const cx = r.rect.x + r.rect.w / 2 - 0.5;
            const cy = r.rect.y;
            const s = isoToScreen(cx, cy);
            return (
              <div
                key={`sign-${r.id}`}
                className="room-sign"
                style={
                  {
                    left: s.x,
                    top: s.y - 6,
                    zIndex: 9000,
                    ["--room" as string]: a?.color,
                  } as React.CSSProperties
                }
              >
                <span className="em">{a?.avatar}</span>
                {a?.room}
              </div>
            );
          })}

          {/* characters */}
          {AGENTS.map((def) => (
            <Character key={def.id} rt={agents[def.id]} def={def} />
          ))}
        </div>
      </div>
    </div>
  );
}
