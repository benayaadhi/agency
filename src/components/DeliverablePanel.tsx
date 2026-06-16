"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AGENTS_BY_ID } from "@/agents/registry";
import { useGame } from "@/game/store";
import { extractArtifact } from "@/lib/artifact";
import { Markdown } from "./Markdown";

export function DeliverablePanel() {
  const activeId = useGame((s) => s.activeDeliverableId);
  const deliverables = useGame((s) => s.deliverables);
  const close = useGame((s) => s.closeDeliverable);

  const deliverable = activeId ? deliverables[activeId] : null;
  const def = activeId ? AGENTS_BY_ID[activeId] : null;

  const artifact = useMemo(
    () => (deliverable ? extractArtifact(deliverable.text) : { html: null, notes: "" }),
    [deliverable],
  );
  const hasHtml = !!artifact.html;
  const [view, setView] = useState<"preview" | "code">("preview");

  // Typewriter reveal for text-only deliverables (skipped when there's a live preview).
  const [shown, setShown] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setView("preview");
    if (!deliverable || hasHtml) {
      setShown(deliverable && hasHtml ? artifact.notes : "");
      return;
    }
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
  }, [deliverable, hasHtml, artifact.notes]);

  if (!deliverable || !def) return null;
  const typing = !hasHtml && shown.length < deliverable.text.length;

  const openInTab = () => {
    if (!artifact.html) return;
    const blob = new Blob([artifact.html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="panel" style={{ ["--c" as string]: def.color } as React.CSSProperties}>
      <div className="head">
        <div className="ava">{def.avatar}</div>
        <div>
          <div className="nm">{def.name}</div>
          <div className="ti">{def.title} · {def.room}</div>
        </div>
        {hasHtml && (
          <div className="toggle">
            <button className={view === "preview" ? "on" : ""} onClick={() => setView("preview")}>
              Preview
            </button>
            <button className={view === "code" ? "on" : ""} onClick={() => setView("code")}>
              Code
            </button>
          </div>
        )}
        <button className="x" onClick={close} aria-label="Close">×</button>
      </div>

      {hasHtml ? (
        <div className="body nopad" ref={bodyRef}>
          {view === "preview" ? (
            <iframe
              className="preview-frame"
              title="motion preview"
              sandbox="allow-scripts allow-pointer-lock"
              srcDoc={artifact.html ?? ""}
            />
          ) : (
            <pre className="codeblock">{artifact.html}</pre>
          )}
          {artifact.notes && (
            <div className="notes">
              <Markdown text={artifact.notes} />
            </div>
          )}
        </div>
      ) : (
        <div className="body" ref={bodyRef}>
          <Markdown text={shown} />
          {typing && <span className="cursor" />}
        </div>
      )}

      <div className="foot">
        <span>via <b style={{ color: "var(--text)" }}>{deliverable.provider}</b></span>
        <span>{deliverable.model}</span>
        <span>{(deliverable.elapsedMs / 1000).toFixed(1)}s</span>
        {hasHtml && (
          <button className="openlink" onClick={openInTab}>↗ Open</button>
        )}
      </div>
    </div>
  );
}
