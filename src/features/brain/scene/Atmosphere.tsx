import * as THREE from "three";
import { brainTokens } from "../tokens";

export function Atmosphere() {
  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[1.65, 32, 32]} />
      <meshBasicMaterial color={brainTokens.pin.doc} transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}
