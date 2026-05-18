import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { BrainData } from "./brain.types";
import { BrainOverlay } from "./overlay/BrainOverlay";
import { DetailPanel } from "./panel/DetailPanel";
import { Atmosphere } from "./scene/Atmosphere";
import { BrainSphere } from "./scene/BrainSphere";
import { CameraController } from "./scene/CameraController";
import { DustParticles } from "./scene/DustParticles";
import { Pins } from "./scene/Pins";
import { brainTokens } from "./tokens";
import { useBrainStore } from "./state/brainStore";

export function ProjectBrain({ data }: { data: BrainData }) {
  const selectedNode = useBrainStore((state) => state.selectedNode);
  const clearSelection = useBrainStore((state) => state.clearSelection);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#1A1612]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        className="h-full w-full"
        onPointerMissed={clearSelection}
      >
        <color attach="background" args={[brainTokens.void]} />
        <fog attach="fog" args={[brainTokens.void, 6, 14]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.7} color="#FAF8F5" />
        <pointLight position={[-3, -2, -4]} intensity={0.25} color="#B8543D" />
        <Suspense fallback={null}>
          <BrainSphere />
          <Atmosphere />
          <DustParticles />
          <Pins nodes={data.nodes} />
        </Suspense>
        <CameraController targetNode={selectedNode} />
      </Canvas>
      <BrainOverlay data={data} />
      <DetailPanel />
    </div>
  );
}
