"use client";

import { useMemo } from "react";
import { WireMap } from "@/components/WireMap";
import {
  TONE_ACCENT,
  type DiagramEdge,
  type GitRepoDiagram,
} from "@/data/gitdiagram";

type Props = {
  diagram: GitRepoDiagram;
  activeEdgeIds: Set<string>;
  primaryEdgeId?: string | null;
  playing: boolean;
  highlightNodes: Set<string>;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
};

export function GitDiagramCanvas({
  diagram,
  activeEdgeIds,
  primaryEdgeId,
  playing,
  highlightNodes,
  selectedId,
  onSelect,
}: Props) {
  const zones = useMemo(
    () => diagram.groups.map((g) => ({ ...g, accent: TONE_ACCENT[g.tone] })),
    [diagram.groups],
  );
  const nodes = useMemo(
    () =>
      diagram.nodes.map((n) => ({
        id: n.id,
        label: n.label,
        sub: n.hint,
        icon: n.icon,
        accent: TONE_ACCENT[n.tone],
        x: n.x,
        y: n.y,
        external: n.external,
      })),
    [diagram.nodes],
  );

  return (
    <WireMap
      width={diagram.viewBox.w}
      height={diagram.viewBox.h}
      zones={zones}
      nodes={nodes}
      edges={diagram.edges}
      liveEdges={activeEdgeIds}
      primaryEdgeId={primaryEdgeId}
      activeNodes={highlightNodes}
      selectedId={selectedId}
      playing={playing}
      onSelect={onSelect}
    />
  );
}

export function collectFlowNodes(
  diagram: GitRepoDiagram,
  edgeIds: string[],
): Set<string> {
  const ids = new Set<string>();
  for (const eid of edgeIds) {
    const e = diagram.edges.find((x) => x.id === eid);
    if (e) {
      ids.add(e.from);
      ids.add(e.to);
    }
  }
  return ids;
}

export function pickPrimaryEdge(
  edges: DiagramEdge[],
  edgeIds: string[],
  tick: number,
): string | null {
  if (!edgeIds.length) return null;
  return edgeIds[tick % edgeIds.length] ?? null;
}
