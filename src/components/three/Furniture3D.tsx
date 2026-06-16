"use client";

import { useGLTF } from "@react-three/drei";
import { MODELS } from "./models";

/** Optional glb prop loader (desk/chair/table). Only mounted when configured. */
function GlbProp({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} scale={scale} />;
}

const WOOD = "#7a5c3e";
const WOOD_DARK = "#5b4530";
const METAL = "#3a4257";

export function Desk({ color = "#4a5168" }: { color?: string }) {
  if (MODELS.desk) return <GlbProp url={MODELS.desk} />;
  return (
    <group>
      {/* top */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.08, 0.8]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {/* legs */}
      {[
        [-0.65, -0.32],
        [0.65, -0.32],
        [-0.65, 0.32],
        [0.65, 0.32],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.37, z]} castShadow>
          <boxGeometry args={[0.08, 0.74, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      {/* monitor */}
      <mesh position={[0, 1.12, -0.18]} castShadow>
        <boxGeometry args={[0.6, 0.38, 0.05]} />
        <meshStandardMaterial color="#10141f" emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.86, -0.18]}>
        <boxGeometry args={[0.08, 0.18, 0.08]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
    </group>
  );
}

export function Chair({ color = "#2b3350" }: { color?: string }) {
  if (MODELS.chair) return <GlbProp url={MODELS.chair} />;
  return (
    <group>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.46]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.74, -0.19]} castShadow>
        <boxGeometry args={[0.46, 0.5, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.44, 8]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 12]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
    </group>
  );
}

export function MeetingTable() {
  if (MODELS.table) return <GlbProp url={MODELS.table} />;
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 0.72, 16]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  );
}
