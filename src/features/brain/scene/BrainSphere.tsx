import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useBrainStore } from "../state/brainStore";
import { brainTokens } from "../tokens";

export function BrainSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const isPaused = useBrainStore((state) => state.isRotationPaused);
  const reducedMotion = useReducedMotion();

  const dotGeometry = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const radius = 1.51;
    const phi = Math.PI * (Math.sqrt(5) - 1);

    for (let index = 0; index < count; index += 1) {
      const y = 1 - (index / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * index;
      positions[index * 3] = Math.cos(theta) * r * radius;
      positions[index * 3 + 1] = y * radius;
      positions[index * 3 + 2] = Math.sin(theta) * r * radius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || isPaused || reducedMotion) {
      return;
    }
    groupRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => useBrainStore.getState().setRotationPaused(true)}
      onPointerLeave={() => useBrainStore.getState().setRotationPaused(false)}
      onPointerDown={() => useBrainStore.getState().setRotationPaused(true)}
      onPointerUp={() => useBrainStore.getState().setRotationPaused(false)}
    >
      <mesh frustumCulled={false}>
        <sphereGeometry args={[1.48, 64, 64]} />
        <meshStandardMaterial color={brainTokens.sphereCore} roughness={0.9} metalness={0.1} />
      </mesh>

      <points geometry={dotGeometry} frustumCulled={false}>
        <pointsMaterial size={0.018} color="#FAF8F5" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
      </points>

      <mesh frustumCulled={false}>
        <sphereGeometry args={[1.502, 24, 16]} />
        <meshBasicMaterial color="#FAF8F5" wireframe transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}
