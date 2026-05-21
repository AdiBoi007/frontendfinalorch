import * as THREE from "three";
import { brainTokens } from "../tokens";

export function Atmosphere() {
  return (
    <>
      <mesh frustumCulled={false}>
        <sphereGeometry args={[1.72, 32, 32]} />
        <meshBasicMaterial color={brainTokens.rust} transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh frustumCulled={false}>
        <sphereGeometry args={[1.56, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}
