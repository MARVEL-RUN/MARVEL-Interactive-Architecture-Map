import type { DrawerContent, DrawerLink } from "@/components/NodeDrawer";
import { NODES } from "@/data/flow";
import { GIT_REPOS, TONE_ACCENT } from "@/data/gitdiagram";
import {
  GIT_TO_WIRE,
  NETWORK_TO_WIRE,
  WIRE_EDGES,
  WIRE_NODE_MAP,
  WIRE_SCENARIOS,
  WIRE_ZONE_MAP,
} from "@/data/integrated";
import { switchesForNode } from "@/data/switches";

function switchLinks(wireId?: string) {
  return wireId ? switchesForNode(wireId).map((s) => ({ id: s.id, title: s.title })) : [];
}

type Edge = { from: string; to: string; label?: string };

function connections(
  id: string,
  edges: Edge[],
  labelOf: (id: string) => string | undefined,
): DrawerLink[] {
  const out: DrawerLink[] = [];
  for (const e of edges) {
    if (e.from === id) {
      const label = labelOf(e.to);
      if (label) out.push({ id: e.to, label, relation: e.label ? `→ ${e.label}` : "→" });
    } else if (e.to === id) {
      const label = labelOf(e.from);
      if (label) out.push({ id: e.from, label, relation: e.label ? `← ${e.label}` : "←" });
    }
  }
  return out;
}

export function wireDetail(id: string): DrawerContent | null {
  const node = WIRE_NODE_MAP.get(id);
  if (!node) return null;
  const zone = WIRE_ZONE_MAP.get(node.zone);
  const scenarios = WIRE_SCENARIOS.flatMap((s, index) =>
    s.steps.some((st) => {
      const e = WIRE_EDGES.find((x) => x.id === st.edge);
      return e && (e.from === id || e.to === id);
    })
      ? [{ index, title: s.title }]
      : [],
  );
  return {
    title: node.label,
    kicker: zone?.label ?? "",
    sub: node.sub,
    icon: node.icon,
    accent: node.accent,
    summary: node.detail.summary,
    sections: [
      { label: "엔드포인트", items: node.detail.endpoints ?? [], mono: true },
      { label: "파일", items: node.detail.files ?? [], mono: true },
      { label: "환경변수 · 설정", items: node.detail.env ?? [], mono: true },
      { label: "참고", items: node.detail.notes ?? [] },
    ],
    links: connections(id, WIRE_EDGES, (x) => WIRE_NODE_MAP.get(x)?.label),
    scenarios,
    switches: switchLinks(id),
  };
}

export function gitDetail(repo: "frontend" | "backend", id: string): DrawerContent | null {
  const diagram = GIT_REPOS[repo];
  const node = diagram.nodes.find((n) => n.id === id);
  if (!node) return null;
  const group = diagram.groups.find(
    (g) => node.x >= g.x && node.x <= g.x + g.w && node.y >= g.y && node.y <= g.y + g.h,
  );
  const wireId = GIT_TO_WIRE[`${repo}:${id}`];
  const wire = wireId ? WIRE_NODE_MAP.get(wireId) : undefined;
  return {
    title: node.label,
    kicker: `GitDiagram · ${repo === "frontend" ? "Frontend" : "Backend"}${group ? ` · ${group.label}` : ""}`,
    sub: node.hint,
    icon: node.icon,
    accent: TONE_ACCENT[node.tone],
    summary: wire
      ? wire.detail.summary
      : "GitDiagram이 저장소 구조에서 뽑은 컴포넌트입니다.",
    sections: [
      { label: "실제 코드 기준 파일", items: wire?.detail.files ?? [], mono: true },
      { label: "엔드포인트", items: wire?.detail.endpoints ?? [], mono: true },
    ],
    links: connections(id, diagram.edges, (x) => diagram.nodes.find((n) => n.id === x)?.label),
    switches: switchLinks(wireId),
    wireId,
    externalUrl: diagram.gitdiagramUrl,
  };
}

export function networkDetail(id: string): DrawerContent | null {
  const node = NODES.find((n) => n.id === id);
  const wireId = NETWORK_TO_WIRE[id];
  const wire = wireId ? WIRE_NODE_MAP.get(wireId) : undefined;
  if (!node) return null;
  return {
    title: node.label,
    kicker: "네트워크 지도",
    sub: node.sub,
    icon: node.icon,
    accent: node.accent,
    summary: wire?.detail.summary ?? node.sub,
    sections: [
      { label: "엔드포인트", items: wire?.detail.endpoints ?? [], mono: true },
      { label: "파일", items: wire?.detail.files ?? [], mono: true },
      { label: "환경변수 · 설정", items: wire?.detail.env ?? [], mono: true },
    ],
    links: [],
    switches: switchLinks(wireId),
    wireId,
  };
}
