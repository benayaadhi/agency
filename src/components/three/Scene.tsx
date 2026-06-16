"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { AGENTS, AGENTS_BY_ID } from "@/agents/registry";
import { MEETING, ROOMS, GRID_W, GRID_H } from "@/game/office";
import { useGame } from "@/game/store";
import { Character3D } from "./Character3D";
import { Room3D } from "./Room3D";
import { MeetingTable } from "./Furniture3D";
import { OFFSET_X, OFFSET_Z } from "./util";

/** Drives the logic/motion tick from the render loop. */
function Ticker() {
  useFrame((_, dt) => useGame.getState().tick(Math.min(dt, 0.05)));
  return null;
}

function Office() {
  const mx = MEETING.x - OFFSET_X;
  const mz = MEETING.y - OFFSET_Z;
  return (
    <group>
      {/* base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[GRID_W + 4, GRID_H + 4]} />
        <meshStandardMaterial color="#1a1f30" roughness={1} />
      </mesh>

      {/* rooms (floor + walls + desk + chair + sign) */}
      {ROOMS.map((r) => (
        <Room3D key={r.id} room={r} agent={AGENTS_BY_ID[r.id]} />
      ))}

      {/* meeting area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mx, 0.03, mz]} receiveShadow>
        <circleGeometry args={[1.8, 40]} />
        <meshStandardMaterial color="#5b4b8a" transparent opacity={0.35} roughness={1} />
      </mesh>
      <group position={[mx, 0, mz]}>
        <MeetingTable />
      </group>

      {/* characters */}
      {AGENTS.map((def) => (
        <Character3D key={def.id} def={def} />
      ))}

      <ContactShadows position={[0, 0.04, 0]} scale={GRID_W + 6} blur={2.2} opacity={0.35} far={6} />
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#0e1018"]} />
      <fog attach="fog" args={["#0e1018", 28, 60]} />

      <PerspectiveCamera makeDefault position={[15, 15, 18]} fov={36} />
      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        maxPolarAngle={1.25}
        minDistance={9}
        maxDistance={42}
        enableDamping
        dampingFactor={0.08}
      />

      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#cfd6ff", "#1a1f30", 0.5]} />
      <directionalLight
        position={[12, 20, 8]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />

      <Office />
      <Ticker />
    </Canvas>
  );
}
