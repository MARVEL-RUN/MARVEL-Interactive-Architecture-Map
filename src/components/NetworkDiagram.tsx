"use client";

import { useMemo } from "react";
import {
  MESH_EDGES,
  NODE_LAYOUT,
  type MeshEdge,
} from "@/data/network";
import styles from "./wire.module.css";

type Props = {
  activePath: Set<string>;
  flowFrom?: string;
  flowTo?: string;
  playing: boolean;
  pulseLabel?: string;
};

function linePoints(from: string, to: string) {
  const a = NODE_LAYOUT[from];
  const b = NODE_LAYOUT[to];
  if (!a || !b) return null;
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

function edgeActive(edge: MeshEdge, active: Set<string>) {
  return active.has(edge.from) && active.has(edge.to);
}

export function NetworkDiagram({
  activePath,
  flowFrom,
  flowTo,
  playing,
  pulseLabel,
}: Props) {
  const directed = useMemo(() => {
    if (!flowFrom || !flowTo || flowFrom === flowTo) return null;
    const forward = MESH_EDGES.find(
      (e) => e.from === flowFrom && e.to === flowTo,
    );
    if (forward) return { edge: forward, reverse: false };
    const backward = MESH_EDGES.find(
      (e) => e.from === flowTo && e.to === flowFrom,
    );
    if (backward) return { edge: backward, reverse: true };
    return null;
  }, [flowFrom, flowTo]);

  const primaryId = directed?.edge.id ?? null;
  const animateReverse = directed?.reverse ?? false;

  return (
    <div className={styles.networkCanvas}>
      <svg
        className={styles.networkSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <filter id="wireBloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.45" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {MESH_EDGES.map((edge) => {
          const pts = linePoints(edge.from, edge.to);
          if (!pts) return null;
          const isLive = edgeActive(edge, activePath);
          const isPrimary = primaryId === edge.id;
          const gradId = `flow-${edge.id}`;

          return (
            <g key={edge.id}>
              <linearGradient
                id={gradId}
                gradientUnits="userSpaceOnUse"
                x1={pts.x1}
                y1={pts.y1}
                x2={pts.x2}
                y2={pts.y2}
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>

              <line
                {...pts}
                className={`${styles.meshLine} ${styles[`meshKind_${edge.kind}`]} ${
                  isLive ? styles.meshLineLive : ""
                }`}
              />

              {isLive ? (
                <line
                  {...pts}
                  className={`${styles.meshShimmer} ${
                    isPrimary ? styles.meshShimmerPrimary : ""
                  } ${playing ? styles.meshShimmerRun : ""} ${
                    animateReverse && isPrimary ? styles.meshShimmerReverse : ""
                  }`}
                  stroke={`url(#${gradId})`}
                />
              ) : null}

              {isLive && isPrimary && playing ? (
                <>
                  <line
                    {...pts}
                    className={`${styles.meshPacket} ${styles[`meshPacket_${edge.kind}`]} ${
                      animateReverse ? styles.meshShimmerReverse : ""
                    } ${styles.meshPacketRun}`}
                    style={{ animationDelay: "0ms" }}
                  />
                  <line
                    {...pts}
                    className={`${styles.meshPacket} ${styles[`meshPacket_${edge.kind}`]} ${
                      animateReverse ? styles.meshShimmerReverse : ""
                    } ${styles.meshPacketRun}`}
                    style={{ animationDelay: "420ms" }}
                  />
                  <line
                    {...pts}
                    className={`${styles.meshPacket} ${styles[`meshPacket_${edge.kind}`]} ${
                      animateReverse ? styles.meshShimmerReverse : ""
                    } ${styles.meshPacketRun}`}
                    style={{ animationDelay: "840ms" }}
                  />
                </>
              ) : null}
            </g>
          );
        })}

        {Array.from(activePath).map((id) => {
          const p = NODE_LAYOUT[id];
          if (!p) return null;
          return (
            <g key={`hub-${id}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4.2}
                className={`${styles.nodeHubRing} ${playing ? styles.nodeHubRingPulse : ""}`}
              />
              <circle cx={p.x} cy={p.y} r={1.2} className={styles.nodeHubCore} />
            </g>
          );
        })}
      </svg>

      {pulseLabel ? (
        <p className={styles.networkCaption}>
          <span className={styles.pulseDot} />
          {pulseLabel}
        </p>
      ) : null}
    </div>
  );
}
