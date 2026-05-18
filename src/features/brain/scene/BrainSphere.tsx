export function BrainSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.48, 64, 64]} />
      <meshStandardMaterial color="#241D17" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}
