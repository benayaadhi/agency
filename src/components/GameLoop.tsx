"use client";

import { useEffect } from "react";
import { useGame } from "@/game/store";

/** Drives the animation/motion tick via requestAnimationFrame. */
export function GameLoop() {
  const tick = useGame((s) => s.tick);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      tick(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);
  return null;
}
