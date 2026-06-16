"use client";

import { useEffect } from "react";
import { Office } from "@/components/Office";
import { GameLoop } from "@/components/GameLoop";
import { Roster } from "@/components/Roster";
import { BriefBar } from "@/components/BriefBar";
import { DeliverablePanel } from "@/components/DeliverablePanel";
import { useGame } from "@/game/store";

export default function Page() {
  const providerInfo = useGame((s) => s.providerInfo);
  const setProviderInfo = useGame((s) => s.setProviderInfo);
  const error = useGame((s) => s.error);

  useEffect(() => {
    fetch("/api/generate")
      .then((r) => r.json())
      .then((d) => setProviderInfo({ provider: d.provider, model: d.model }))
      .catch(() => {});
  }, [setProviderInfo]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          Agency<span className="dot">.</span>Tycoon
          <small>your AI marketing agency — give a brief, watch it get built</small>
        </div>
        <div className="spacer" />
        {providerInfo && (
          <div className="badge">
            engine <b>{providerInfo.provider}</b> · {providerInfo.model}
          </div>
        )}
      </header>

      <main className="stage">
        <Office />
        <Roster />
        {error && <div className="error-toast">⚠ {error}</div>}
        <DeliverablePanel />
      </main>

      <BriefBar />
      <GameLoop />
    </div>
  );
}
