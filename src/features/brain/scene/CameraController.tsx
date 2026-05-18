import { CameraControls } from "@react-three/drei";

export function CameraController() {
  return <CameraControls minDistance={3} maxDistance={8} draggingSmoothTime={0.05} dollyToCursor={false} truckSpeed={0} />;
}
