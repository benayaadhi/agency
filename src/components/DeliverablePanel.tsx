"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS_BY_ID } from "@/agents/registry";
import { useGame } from "@/game/store";
import { Markdown } from "./Markdown";

export function DeliverablePanel() {
  const activeId = useGame((s) => s.activeDeliverableId);
  const deliverables = useGame((s) => s.deliverables);
  const close = useGame((s) => s.closeDeliverable);

  const deliverable = activeId ? deliverables[activeId] : null;
  const def = activeId ? AGENTS_BY_ID[activeId] : null;

  // Typewriter reveal for a "live" feel.
  const [shown, setShown] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!deliverable) return;
    setShown("");
    const full = deliverable.text;
    let i = 0;
    const chunk = Math.max(2, Math.round(full.length / 240));
    const timer = setInterval(() => {
      i = Math.min(full.length, i + chunk);
      setShown(full.slice(0, i));
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      if (i >= full.length) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [deliverable]);

  if (!deliverable || !def) return null;
  const typing = shown.length < deliverable.text.length;

  return (
    <div className="panel" style={{ ["--c" as string]: def.color } as React.CSSProperties}>
      <div className="head">
        <div className="ava">{def.avatar}</div>
        <div>
          <div className="nm">{def.name}</div>
          <div className="ti">{def.title} · {def.room}</div>
        </div>
        <button className="x" onClick={close} aria-label="Close">×</button>
      </div>
      <div className="body" ref={bodyRef}>
        <Markdown text={shown} />
        {typing && <span className="cursor" />}
      </div>
      <div className="foot">
        <span>via <b style={{ color: "var(--text)" }}>{deliverable.provider}</b></span>
        <span>{deliverable.model}</span>
        <span>{(deliverable.elapsedMs / 1000).toFixed(1)}s</span>
      </div>
    </div>
  );
}
