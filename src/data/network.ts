/** viewBox 0–100 좌표 (퍼센트) */
export const NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  browser: { x: 50, y: 22 },
  "env-fe": { x: 16, y: 28 },
  toss: { x: 84, y: 28 },
  api: { x: 50, y: 54 },
  "env-be": { x: 84, y: 58 },
  db: { x: 50, y: 82 },
};

export type MeshEdgeKind = "http" | "config" | "secret" | "sdk";

export type MeshEdge = {
  id: string;
  from: string;
  to: string;
  kind: MeshEdgeKind;
};

/** 항상 그리는 백본 네트워크 */
export const MESH_EDGES: MeshEdge[] = [
  { id: "fe-browser", from: "env-fe", to: "browser", kind: "config" },
  { id: "browser-toss", from: "browser", to: "toss", kind: "sdk" },
  { id: "browser-api", from: "browser", to: "api", kind: "http" },
  { id: "api-db", from: "api", to: "db", kind: "http" },
  { id: "api-envbe", from: "api", to: "env-be", kind: "config" },
  { id: "envbe-toss", from: "env-be", to: "toss", kind: "secret" },
  { id: "api-toss", from: "api", to: "toss", kind: "secret" },
  { id: "toss-browser", from: "toss", to: "browser", kind: "sdk" },
];

export function edgeKey(from: string, to: string) {
  return `${from}→${to}`;
}

export function findMeshEdge(from: string, to: string) {
  return MESH_EDGES.find((e) => e.from === from && e.to === to);
}
