"use client";

import { isoToScreen, TILE_H } from "@/game/iso";
import type { AgentRuntime } from "@/game/store";
import type { AgentDef } from "@/agents/registry";

export function Character({
  rt,
  def,
}: {
  rt: AgentRuntime;
  def: AgentDef;
}) {
  const s = isoToScreen(rt.pos.x, rt.pos.y);
  const moving = rt.status === "out" || rt.status === "back";
  const bobY = moving ? Math.sin(rt.bob) * 3 : 0;

  // foot at tile center
  const left = s.x;
  const top = s.y + TILE_H / 2 - bobY;
  const z = Math.round((rt.pos.x + rt.pos.y) * 10) + 5;

  let bubble: React.ReactNode = null;
  if (rt.status === "work") {
    bubble = (
      <div className="bubble think">
        working
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    );
  } else if (rt.status === "out") {
    bubble = <div className="bubble">On it!</div>;
  } else if (rt.status === "back") {
    bubble = <div className="bubble">Done ✓</div>;
  }

  return (
    <div
      className={`char ${rt.facing < 0 ? "flip" : ""} ${moving || rt.status === "work" ? "busy" : ""}`}
      style={
        {
          left,
          top,
          zIndex: z,
          ["--c" as string]: def.color,
        } as React.CSSProperties
      }
    >
      {bubble}
      <div className="head">{def.avatar}</div>
      <div className="body" />
      <div className="shadow" />
    </div>
  );
}
