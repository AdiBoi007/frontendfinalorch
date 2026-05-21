import { useMemo } from "react";
import * as THREE from "three";
import type { BrainNode } from "../brain.types";
import { sphericalToCartesian } from "../lib/sphericalToCartesian";
import { useBrainStore } from "../state/brainStore";
import { brainTokens } from "../tokens";

const ARC_RADIUS = 1.62;
const SURFACE_RADIUS = 1.52;

type ArcSegment = {
  key: string;
  geometry: THREE.BufferGeometry;
  color: string;
  sourceId: string;
  targetId: string;
};

function pairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function buildArcGeometry(node: BrainNode, target: BrainNode) {
  const start = sphericalToCartesian(node.position?.lat ?? 0, node.position?.lng ?? 0, SURFACE_RADIUS);
  const end = sphericalToCartesian(target.position?.lat ?? 0, target.position?.lng ?? 0, SURFACE_RADIUS);
  const mid = start
    .clone()
    .add(end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(ARC_RADIUS);
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  return new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
}

function collectArcs(nodes: BrainNode[]): ArcSegment[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const seen = new Set<string>();
  const arcs: ArcSegment[] = [];

  for (const node of nodes) {
    if (!node.connections?.length) {
      continue;
    }

    for (const targetId of node.connections) {
      const key = pairKey(node.id, targetId);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const target = nodeById.get(targetId);
      if (!target) {
        continue;
      }

      arcs.push({
        key,
        geometry: buildArcGeometry(node, target),
        color: brainTokens.pin[node.category],
        sourceId: node.id,
        targetId: target.id
      });
    }
  }

  return arcs;
}

function ArcLine({
  arc,
  opacity
}: {
  arc: ArcSegment;
  opacity: number;
}) {
  return (
    <line geometry={arc.geometry} frustumCulled={false}>
      <lineBasicMaterial color={arc.color} transparent opacity={opacity} depthWrite={false} />
    </line>
  );
}

export function ConnectionArcs({ nodes }: { nodes: BrainNode[] }) {
  const selectedNode = useBrainStore((state) => state.selectedNode);

  const arcs = useMemo(() => collectArcs(nodes), [nodes]);

  return (
    <group frustumCulled={false}>
      {arcs.map((arc) => {
        const isConnected =
          selectedNode !== null && (selectedNode.id === arc.sourceId || selectedNode.id === arc.targetId);
        const opacity = selectedNode ? (isConnected ? 0.55 : 0.04) : 0.18;

        return <ArcLine key={arc.key} arc={arc} opacity={opacity} />;
      })}
    </group>
  );
}
