"use client";

import { useMemo, type MouseEvent } from "react";
import { NodeCard } from "@/components/NodeCard";
import type { IconName } from "@/components/WireIcon";
import styles from "./wire.module.css";

export type MapZone = {
  id: string;
  label: string;
  accent: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type MapNode = {
  id: string;
  label: string;
  sub?: string;
  icon: IconName;
  accent: string;
  x: number;
  y: number;
  external?: boolean;
};

export type MapEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  kind?: string;
};

type Props = {
  width: number;
  height: number;
  zones: MapZone[];
  nodes: MapNode[];
  edges: MapEdge[];
  /** Edges drawn as lit lines with light flow. */
  liveEdges: Set<string>;
  primaryEdgeId?: string | null;
  /** Nodes drawn at full brightness. */
  activeNodes: Set<string>;
  /** Nodes on the current step — get an extra ring. */
  focusNodes?: Set<string>;
  selectedId?: string | null;
  playing: boolean;
  onSelect?: (id: string | null) => void;
};

function edgePath(a: MapNode, b: MapNode) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const bend = Math.max(40, Math.abs(dx) * 0.45) * Math.sign(dx || 1);
    return `M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}`;
  }
  const bend = Math.max(40, Math.abs(dy) * 0.45) * Math.sign(dy || 1);
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + bend}, ${b.x} ${b.y - bend}, ${b.x} ${b.y}`;
}

export function WireMap({
  width,
  height,
  zones,
  nodes,
  edges,
  liveEdges,
  primaryEdgeId,
  activeNodes,
  focusNodes,
  selectedId,
  playing,
  onSelect,
}: Props) {
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const primary = edges.find((e) => e.id === primaryEdgeId);
  const pa = primary ? nodeMap.get(primary.from) : undefined;
  const pb = primary ? nodeMap.get(primary.to) : undefined;

  const pick = (id: string) => (e: MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id === selectedId ? null : id);
  };

  return (
    <div
      className={styles.gitWorld}
      style={{ width, height }}
      onClick={() => onSelect?.(null)}
    >
      <svg
        className={styles.gitSvg}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
      >
        {zones.map((z) => (
          <g key={z.id} style={{ ["--accent" as string]: z.accent }}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={18} className={styles.gitGroup} />
            <text x={z.x + 18} y={z.y + 26} className={styles.gitGroupLabel}>
              {z.label.toUpperCase()}
            </text>
          </g>
        ))}

        {edges.map((edge) => {
          const a = nodeMap.get(edge.from);
          const b = nodeMap.get(edge.to);
          if (!a || !b) return null;
          const live = liveEdges.has(edge.id);
          const isPrimary = primaryEdgeId === edge.id;
          const d = edgePath(a, b);
          return (
            <g
              key={edge.id}
              className={edge.kind ? styles[`edgeKind_${edge.kind}`] : undefined}
            >
              <path
                d={d}
                fill="none"
                className={`${styles.gitEdge} ${edge.dashed ? styles.gitEdgeDashed : ""} ${
                  live ? styles.gitEdgeLive : ""
                }`}
              />
              {live ? (
                <path
                  d={d}
                  fill="none"
                  className={`${styles.gitEdgeFlow} ${
                    isPrimary ? styles.gitEdgeFlowPrimary : ""
                  } ${playing || isPrimary ? styles.gitEdgeFlowRun : ""}`}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`${styles.gitNodeWrap} ${
            focusNodes?.has(node.id) ? styles.nodeFocus : ""
          } ${selectedId === node.id ? styles.nodeSelected : ""}`}
          style={{ left: node.x, top: node.y }}
          onClick={pick(node.id)}
          aria-label={`${node.label} 자세히 보기`}
        >
          <NodeCard
            label={node.label}
            sub={node.sub}
            accent={node.accent}
            icon={node.icon}
            active={activeNodes.has(node.id) || selectedId === node.id}
            external={node.external}
          />
        </button>
      ))}

      {primary?.label && pa && pb ? (
        <span
          className={styles.gitEdgePill}
          style={{ left: (pa.x + pb.x) / 2, top: (pa.y + pb.y) / 2 }}
        >
          {primary.label}
        </span>
      ) : null}
    </div>
  );
}
