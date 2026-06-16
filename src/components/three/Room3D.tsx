"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { Html } from "@react-three/drei";
import type { RoomLayout } from "@/game/office";
import { useGame } from "@/game/store";
import type { AgentDef } from "@/agents/registry";
import { Chair, Desk } from "./Furniture3D";
import { OFFSET_X, OFFSET_Z } from "./util";

const WALL_H = 1.1;
const WALL_T = 0.12;

export function Room3D({ room, agent }: { room: RoomLayout; agent: AgentDef }) {
  const selectedId = useGame((s) => s.selectedId);
  const selectRoom = useGame((s) => s.selectRoom);
  const selected = selectedId === room.id;

  const { rect } = room;
  // world-space center of the room floor
  const cx = rect.x + rect.w / 2 - OFFSET_X;
  const cz = rect.y + rect.h / 2 - OFFSET_Z;

  const color = useMemo(() => new THREE.Color(agent.color), [agent.color]);

  // Desk + chair world position
  const dx = room.desk.x - OFFSET_X;
  const dz = room.desk.y - OFFSET_Z;

  return (
    <group>
      {/* floor */}
      <mesh
        position={[cx, 0.02, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          selectRoom(room.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <planeGeometry args={[rect.w, rect.h]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={selected ? 0.62 : 0.4}
          roughness={0.9}
        />
      </mesh>

      {/* back walls (north + west edges) */}
      <mesh position={[cx, WALL_H / 2, rect.y - OFFSET_Z]} castShadow receiveShadow>
        <boxGeometry args={[rect.w, WALL_H, WALL_T]} />
        <meshStandardMaterial color={color} opacity={0.85} transparent />
      </mesh>
      <mesh position={[rect.x - OFFSET_X, WALL_H / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, rect.h]} />
        <meshStandardMaterial color={color} opacity={0.85} transparent />
      </mesh>

      {/* desk + chair */}
      <group position={[dx, 0, dz]}>
        <Desk color={agent.color} />
        <group position={[0, 0, 0.62]} rotation={[0, Math.PI, 0]}>
          <Chair color={agent.color} />
        </group>
      </group>

      {/* room sign */}
      <Html position={[cx, WALL_H + 0.5, rect.y - OFFSET_Z]} center distanceFactor={13} pointerEvents="none">
        <div className="sign3d" style={{ ["--c" as string]: agent.color } as React.CSSProperties}>
          <span>{agent.avatar}</span> {agent.room}
        </div>
      </Html>
    </group>
  );
}
