"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/game/store";
import type { AgentDef } from "@/agents/registry";
import { MODELS } from "./models";
import { OFFSET_X, OFFSET_Z } from "./util";

const SKIN = "#f1c9a5";

/** A blocky low-poly human built from primitives — animated walk + idle. */
function ProceduralHuman({ color, swing }: { color: string; swing: React.MutableRefObject<number> }) {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = Math.sin(swing.current);
    if (legL.current) legL.current.rotation.x = s * 0.7;
    if (legR.current) legR.current.rotation.x = -s * 0.7;
    if (armL.current) armL.current.rotation.x = -s * 0.5;
    if (armR.current) armR.current.rotation.x = s * 0.5;
  });

  return (
    <group>
      {/* head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.34]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* hair */}
      <mesh position={[0, 1.66, 0]} castShadow>
        <boxGeometry args={[0.37, 0.12, 0.37]} />
        <meshStandardMaterial color="#3a2c22" />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.04, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.28]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* arms (pivot at shoulder) */}
      <group ref={armL} position={[-0.33, 1.28, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.14, 0.56, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group ref={armR} position={[0.33, 1.28, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.14, 0.56, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* legs (pivot at hip) */}
      <group ref={legL} position={[-0.14, 0.72, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.18, 0.72, 0.2]} />
          <meshStandardMaterial color="#2b3350" />
        </mesh>
      </group>
      <group ref={legR} position={[0.14, 0.72, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.18, 0.72, 0.2]} />
          <meshStandardMaterial color="#2b3350" />
        </mesh>
      </group>
    </group>
  );
}

/** glb-backed character (used when MODELS.character is set). */
function GltfHuman({ moving }: { moving: boolean }) {
  const { scene, animations } = useGLTF(MODELS.character as string);
  const root = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, root);
  const { idle, walk } = MODELS.characterClips;

  useFrame(() => {
    const wantWalk = moving ? walk : idle;
    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return;
      if (name === wantWalk) {
        if (!action.isRunning()) action.reset().fadeIn(0.2).play();
      } else {
        action.fadeOut(0.2);
      }
    });
  });

  return <primitive ref={root} object={scene.clone()} />;
}

export function Character3D({ def }: { def: AgentDef }) {
  const group = useRef<THREE.Group>(null);
  const swing = useRef(0);
  const prev = useRef({ x: 0, z: 0 });
  const targetRotY = useRef(0);

  // Re-render only when the discrete status changes (for the bubble + anim mode).
  const status = useGame((s) => s.agents[def.id]?.status ?? "idle");
  const moving = status === "out" || status === "back";

  useFrame((_, dt) => {
    const rt = useGame.getState().agents[def.id];
    if (!rt || !group.current) return;

    const wx = rt.pos.x - OFFSET_X;
    const wz = rt.pos.y - OFFSET_Z;
    const dx = wx - prev.current.x;
    const dz = wz - prev.current.z;
    const speed = Math.hypot(dx, dz);

    group.current.position.set(wx, 0, wz);

    // Face direction of travel.
    if (speed > 1e-4) {
      targetRotY.current = Math.atan2(dx, dz);
      swing.current += dt * 9;
    } else if (status === "work") {
      swing.current += dt * 2.2; // gentle "busy" sway
    } else {
      swing.current = 0;
    }
    // Smoothly rotate toward heading.
    const cur = group.current.rotation.y;
    let diff = targetRotY.current - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    group.current.rotation.y = cur + diff * Math.min(1, dt * 10);

    prev.current = { x: wx, z: wz };
  });

  const bubble =
    status === "work" ? "💭 working…" : status === "out" ? "On it!" : status === "back" ? "Done ✓" : null;

  return (
    <group ref={group}>
      {MODELS.character ? <GltfHuman moving={moving} /> : <ProceduralHuman color={def.color} swing={swing} />}

      {/* contact shadow blob */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      {/* floating name tag */}
      <Html position={[0, 2.15, 0]} center distanceFactor={12} occlude={false} pointerEvents="none">
        <div className="tag3d" style={{ ["--c" as string]: def.color } as React.CSSProperties}>
          <span>{def.avatar}</span> {def.name}
        </div>
      </Html>

      {bubble && (
        <Html position={[0, 2.62, 0]} center distanceFactor={12} pointerEvents="none">
          <div className={`bubble3d ${status === "work" ? "think" : ""}`}>{bubble}</div>
        </Html>
      )}
    </group>
  );
}

if (MODELS.character) useGLTF.preload(MODELS.character);
