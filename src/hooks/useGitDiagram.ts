"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GIT_REPOS } from "@/data/gitdiagram";
import {
  collectFlowNodes,
  pickPrimaryEdge,
} from "@/components/GitDiagramCanvas";

const FLOW_MS = 1400;
const SCENE_MS = 8200;

export type GitRepoId = "frontend" | "backend";

/** `active` = the GitDiagram tab is visible; timers stay off otherwise. */
export function useGitDiagram(active: boolean) {
  const [repo, setRepo] = useState<GitRepoId>("frontend");
  const [flowIndex, setFlowIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [edgeTick, setEdgeTick] = useState(0);

  const diagram = GIT_REPOS[repo];
  const flow = diagram.flows[flowIndex] ?? diagram.flows[0];

  const activeEdgeIds = useMemo(() => new Set(flow.edgeIds), [flow.edgeIds]);
  const highlightNodes = useMemo(
    () => collectFlowNodes(diagram, flow.edgeIds),
    [diagram, flow.edgeIds],
  );
  const primaryEdgeId = pickPrimaryEdge(diagram.edges, flow.edgeIds, edgeTick);

  useEffect(() => {
    setFlowIndex(0);
    setEdgeTick(0);
  }, [repo]);

  useEffect(() => {
    if (!active || !playing || flow.edgeIds.length < 2) return;
    const t = window.setInterval(() => setEdgeTick((n) => n + 1), FLOW_MS);
    return () => window.clearInterval(t);
  }, [active, playing, flow.edgeIds.length, repo, flowIndex]);

  const nextFlow = useCallback(() => {
    setFlowIndex((i) => (i + 1) % diagram.flows.length);
    setEdgeTick(0);
  }, [diagram.flows.length]);

  useEffect(() => {
    if (!active || !playing) return;
    const t = window.setInterval(nextFlow, SCENE_MS);
    return () => window.clearInterval(t);
  }, [active, playing, nextFlow, flowIndex]);

  const prevFlow = useCallback(() => {
    setFlowIndex((i) => (i - 1 + diagram.flows.length) % diagram.flows.length);
    setEdgeTick(0);
  }, [diagram.flows.length]);

  return {
    repo,
    setRepo,
    flowIndex,
    setFlowIndex,
    playing,
    setPlaying,
    diagram,
    flow,
    activeEdgeIds,
    highlightNodes,
    primaryEdgeId,
    nextFlow,
    prevFlow,
  };
}
