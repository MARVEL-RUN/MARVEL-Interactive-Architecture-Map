"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WIRE_EDGE_MAP, WIRE_SCENARIOS } from "@/data/integrated";

const STEP_MS = 3400;

/** `active` = the integrated tab is visible; the step timer stays off otherwise. */
export function useIntegrated(active: boolean) {
  const [pos, setPos] = useState({ s: 0, i: 0 });
  const [playing, setPlaying] = useState(true);

  const scenario = WIRE_SCENARIOS[pos.s] ?? WIRE_SCENARIOS[0];
  const step = scenario.steps[pos.i] ?? scenario.steps[0];

  const selectScenario = useCallback((s: number) => setPos({ s, i: 0 }), []);
  const setStepIndex = useCallback((i: number) => setPos((p) => ({ ...p, i })), []);

  const nextStep = useCallback(() => {
    setPos((p) => {
      const len = WIRE_SCENARIOS[p.s].steps.length;
      if (p.i + 1 < len) return { ...p, i: p.i + 1 };
      return { s: (p.s + 1) % WIRE_SCENARIOS.length, i: 0 };
    });
  }, []);

  const prevStep = useCallback(() => {
    setPos((p) => ({ ...p, i: Math.max(0, p.i - 1) }));
  }, []);

  useEffect(() => {
    if (!active || !playing) return;
    const t = window.setInterval(nextStep, STEP_MS);
    return () => window.clearInterval(t);
  }, [active, playing, nextStep]);

  const { trailEdges, activeNodes, focusNodes } = useMemo(() => {
    const trail = new Set<string>();
    const active = new Set<string>();
    scenario.steps.slice(0, pos.i + 1).forEach((s) => {
      trail.add(s.edge);
      const e = WIRE_EDGE_MAP.get(s.edge);
      if (e) {
        active.add(e.from);
        active.add(e.to);
      }
    });
    const cur = WIRE_EDGE_MAP.get(step.edge);
    const focus = new Set<string>(cur ? [cur.from, cur.to] : []);
    return { trailEdges: trail, activeNodes: active, focusNodes: focus };
  }, [scenario, pos.i, step.edge]);

  return {
    scenarios: WIRE_SCENARIOS,
    scenario,
    scenarioIndex: pos.s,
    selectScenario,
    step,
    stepIndex: pos.i,
    setStepIndex,
    nextStep,
    prevStep,
    playing,
    setPlaying,
    trailEdges,
    activeNodes,
    focusNodes,
  };
}
