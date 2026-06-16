"use client";

import { AGENTS } from "@/agents/registry";
import { useGame } from "@/game/store";

const STATUS_LABEL: Record<string, string> = {
  idle: "Available",
  out: "Heading in",
  work: "Working",
  back: "Wrapping up",
};

export function Roster() {
  const agents = useGame((s) => s.agents);
  const selectedId = useGame((s) => s.selectedId);
  const busyId = useGame((s) => s.busyId);
  const selectRoom = useGame((s) => s.selectRoom);

  return (
    <div className="roster">
      {AGENTS.map((a) => {
        const rt = agents[a.id];
        const busy = busyId === a.id;
        return (
          <div
            key={a.id}
            className={`card ${selectedId === a.id ? "selected" : ""}`}
            style={{ ["--c" as string]: a.color } as React.CSSProperties}
            onClick={() => selectRoom(a.id)}
          >
            <div className="ava">{a.avatar}</div>
            <div className="meta">
              <div className="nm">{a.name}</div>
              <div className="ti">{a.title}</div>
            </div>
            <div className={`status ${busy ? "busy" : ""}`}>
              {STATUS_LABEL[rt?.status ?? "idle"]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
