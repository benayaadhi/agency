"use client";

import dynamic from "next/dynamic";

// WebGL must not run during SSR.
const Scene = dynamic(() => import("./three/Scene"), {
  ssr: false,
  loading: () => <div className="stage-loading">Building your office…</div>,
});

export function Stage() {
  return <Scene />;
}
