"use client";

import { AGENTS, AGENTS_BY_ID } from "@/agents/registry";
import { useGame } from "@/game/store";

export function BriefBar() {
  const brief = useGame((s) => s.brief);
  const setBrief = useGame((s) => s.setBrief);
  const selectedId = useGame((s) => s.selectedId);
  const selectRoom = useGame((s) => s.selectRoom);
  const busyId = useGame((s) => s.busyId);
  const assign = useGame((s) => s.assign);

  const selected = selectedId ? AGENTS_BY_ID[selectedId] : null;
  const canSend = !!selectedId && brief.trim().length > 0 && !busyId;

  const send = () => {
    if (!canSend || !selectedId) return;
    assign(selectedId, brief.trim());
  };

  return (
    <div className="briefbar" style={{ ["--c" as string]: selected?.color } as React.CSSProperties}>
      <div className="field">
        <div className="selrow">
          {AGENTS.map((a) => (
            <button
              key={a.id}
              className={`chip ${selectedId === a.id ? "on" : ""}`}
              style={{ ["--c" as string]: a.color } as React.CSSProperties}
              onClick={() => selectRoom(a.id)}
            >
              {a.avatar} {a.room}
            </button>
          ))}
        </div>
        <textarea
          value={brief}
          placeholder={
            selected
              ? `Brief for ${selected.name} (${selected.title})…  e.g. "${selected.examples[0]}"`
              : "Pick a room above, then type your brief…"
          }
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
        />
      </div>
      <button className="send" disabled={!canSend} onClick={send}>
        {busyId ? "Working…" : "Send brief ▸"}
      </button>
    </div>
  );
}
