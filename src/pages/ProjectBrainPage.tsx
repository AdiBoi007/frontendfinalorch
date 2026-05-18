import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ProjectBrain } from "../features/brain/ProjectBrain";
import type { BrainCategory, BrainData, BrainNode } from "../features/brain/brain.types";
import { deterministicPosition } from "../features/brain/lib/deterministicPosition";
import { mockProjectBrains } from "../lib/mockData";
import type { BrainCategoryId, BrainNodeData } from "../lib/types";

const categoryMap: Record<BrainCategoryId, BrainCategory> = {
  docs: "doc",
  decisions: "decision",
  comms: "comms",
  team: "team",
  changes: "change"
};

function toBrainNode(node: BrainNodeData, index: number, count: number): BrainNode | null {
  if (node.kind === "core" || !node.category) {
    return null;
  }

  const category = categoryMap[node.category];
  const title = node.label;
  const description =
    node.detailItems?.map((item) => item.description).join(" ") || node.tooltip || `${node.label} is part of the project brain.`;

  return {
    id: node.id,
    category,
    title,
    description,
    source: node.category === "comms" ? title : node.category === "docs" ? "Project memory" : "Brain graph",
    author: node.category === "team" ? title : "Orchestra",
    updatedAt: new Date(Date.UTC(2026, 3, 22 - (index % 8), 9 + (index % 7))).toISOString(),
    featured: node.category === "docs" || node.category === "changes",
    position: deterministicPosition(node.id, category, index, count),
    connections: node.parentId ? [node.parentId] : undefined
  };
}

export function ProjectBrainPage() {
  const { id = "1" } = useParams();
  const brainSeed = mockProjectBrains[id] ?? mockProjectBrains["1"];

  const data = useMemo<BrainData>(() => {
    const seedNodes = brainSeed.nodes.filter((node) => node.kind !== "core");
    const nodes = seedNodes.map((node, index) => toBrainNode(node, index, seedNodes.length)).filter((node): node is BrainNode => Boolean(node));

    return {
      projectId: brainSeed.projectId,
      projectName: brainSeed.projectName,
      nodes,
      syncedAt: new Date(Date.UTC(2026, 3, 22, 9, 58)).toISOString()
    };
  }, [brainSeed]);

  return <ProjectBrain data={data} />;
}
