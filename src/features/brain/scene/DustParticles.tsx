import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "../lib/useReducedMotion";

export function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();

  const geometry = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 8;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[index * 3 + 2] = -2 - Math.random() * 5;
      sizes[index] = 1 + Math.random() * 2;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    dustGeometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    return dustGeometry;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion) {
      return;
    }
    pointsRef.current.rotation.y += delta * 0.006;
    pointsRef.current.rotation.x += delta * 0.002;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.018} color="#FAF8F5" transparent opacity={0.12} sizeAttenuation depthWrite={false} />
    </points>
  );
}
