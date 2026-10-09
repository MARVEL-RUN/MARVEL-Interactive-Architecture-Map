"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  FLOW_LEGEND,
  LAYER_LABEL,
  NODES,
  PAYMENT_HIGHLIGHTS,
  STEPS,
  type FlowStep,
  type SceneLink,
} from "@/data/flow";
import { ARCH_STEPS } from "@/data/architecture";
import {
  WIRE_EDGE_MAP,
  WIRE_EDGES,
  WIRE_NODE_MAP,
  WIRE_NODES,
  WIRE_SIZE,
  WIRE_ZONES,
} from "@/data/integrated";
import { HighlightList } from "@/components/DetailPanels";
import { GitDiagramCanvas } from "@/components/GitDiagramCanvas";
import { useGitDiagram } from "@/hooks/useGitDiagram";
import { useIntegrated } from "@/hooks/useIntegrated";
import { NetworkDiagram } from "@/components/NetworkDiagram";
import { NodeCard } from "@/components/NodeCard";
import { NodeDrawer } from "@/components/NodeDrawer";
import { EnvSwitchPanel } from "@/components/EnvSwitchPanel";
import { ENV_SWITCH_MAP } from "@/data/switches";
import { PannableMap, type MapFocus } from "@/components/PannableMap";
import { WireIcon } from "@/components/WireIcon";
import { WireMap } from "@/components/WireMap";
import { gitDetail, networkDetail, wireDetail } from "@/lib/details";
import { NODE_LAYOUT } from "@/data/network";
import styles from "./wire.module.css";

type View = "integrated" | "architecture" | "payment" | "gitdiagram";

const STEP_MS = 8200;
const TRACE_MS = 1000;
const DRAWER_INSET = 350;

const EDGE_LEGEND: { kind: string; label: string; color: string }[] = [
  { kind: "nav", label: "화면 이동", color: "#93c5fd" },
  { kind: "http", label: "HTTP API", color: "#6ee7b7" },
  { kind: "sdk", label: "Toss SDK/API", color: "#7dd3fc" },
  { kind: "redirect", label: "리다이렉트", color: "#f9a8d4" },
  { kind: "db", label: "DB·저장소", color: "#c4b5fd" },
  { kind: "config", label: "ENV·설정", color: "#fbbf24" },
];

const TRACE_FLOW: Record<
  FlowStep["traces"][number]["layer"],
  { from: string; to: string }
> = {
  client: { from: "browser", to: "api" },
  api: { from: "browser", to: "api" },
  db: { from: "api", to: "db" },
  pg: { from: "api", to: "toss" },
  env: { from: "env-be", to: "toss" },
};

function resolveFlow(step: FlowStep, trace: FlowStep["traces"][number] | undefined) {
  if (step.packetFrom && step.packetTo && step.packetFrom !== step.packetTo) {
    return { from: step.packetFrom, to: step.packetTo };
  }
  if (trace) return TRACE_FLOW[trace.layer];
  return undefined;
}

const EMPTY = new Set<string>();
const NO_SCENES: FlowStep[] = [];
/** Wire-map edges longer than this don't fit on screen, so the camera jumps to the target node. */
const LONG_EDGE = 900;
/** NODE_LAYOUT spans roughly x 16–84 %, y 22–82 % of the network canvas. */
const NETWORK_FIT = { w: 0.9, h: 0.72 };

export function WireExperience() {
  const [view, setView] = useState<View>("integrated");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [traceIndex, setTraceIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [follow, setFollow] = useState(true);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [envOpen, setEnvOpen] = useState(false);
  const [envId, setEnvId] = useState<string | null>(null);
  const [envPicked, setEnvPicked] = useState<Record<string, string>>({});

  const git = useGitDiagram(view === "gitdiagram");
  const wire = useIntegrated(view === "integrated");

  const envHighlight = useMemo(() => {
    const sw = envOpen && envId ? ENV_SWITCH_MAP.get(envId) : undefined;
    if (!sw) return null;
    const value = sw.values.find((v) => v.value === (envPicked[sw.id] ?? sw.fallback));
    const off = new Set(value?.off ?? []);
    const nodes = new Set([...sw.nodes, ...(value?.nodes ?? []), ...off]);
    const live = WIRE_EDGES.filter((e) => nodes.has(e.from) && nodes.has(e.to));
    const edges = new Set(live.map((e) => e.id));
    const offEdges = new Set(
      live.filter((e) => off.has(e.from) || off.has(e.to)).map((e) => e.id),
    );
    return { key: `${sw.id}:${value?.value ?? ""}`, nodes, edges, off, offEdges };
  }, [envOpen, envId, envPicked]);

  const openEnv = useCallback(
    (id: string | null) => {
      setView("integrated");
      setSelected(null);
      setEnvOpen(true);
      setEnvId(id);
      wire.setPlaying(false);
    },
    [wire],
  );

  const scenes: FlowStep[] =
    view === "architecture" ? ARCH_STEPS : view === "payment" ? STEPS : NO_SCENES;
  const step: FlowStep = scenes[index] ?? ARCH_STEPS[0];
  const storyView = view === "architecture" || view === "payment";
  const activeSet = useMemo(
    () => new Set(storyView ? step.activePath : []),
    [step, storyView],
  );

  const switchView = (next: View) => {
    setView(next);
    setIndex(0);
    setTraceIndex(0);
    setSelected(null);
    setEnvOpen(false);
  };

  const focusWireNode = useCallback((id: string) => {
    const n = WIRE_NODE_MAP.get(id);
    if (n) setFocus({ x: n.x, y: n.y, key: `${id}-${Date.now()}` });
  }, []);

  const openWire = useCallback(
    (id: string) => {
      setView("integrated");
      setSelected(id);
      wire.setPlaying(false);
      window.setTimeout(() => focusWireNode(id), 60);
    },
    [focusWireNode, wire],
  );

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % scenes.length);
  }, [scenes.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + scenes.length) % scenes.length);
  }, [scenes.length]);

  useEffect(() => {
    setTraceIndex(0);
  }, [index, view]);

  useEffect(() => {
    if (!storyView || !playing) return;
    const t = window.setInterval(next, STEP_MS);
    return () => window.clearInterval(t);
  }, [playing, next, storyView]);

  useEffect(() => {
    if (!storyView || !playing || step.traces.length < 2) return;
    const t = window.setInterval(() => {
      setTraceIndex((i) => (i + 1) % step.traces.length);
    }, TRACE_MS);
    return () => window.clearInterval(t);
  }, [playing, index, step.traces.length, storyView]);

  // Integrated view: follow camera to the current step's edge midpoint (long edges: the destination).
  const curEdge = WIRE_EDGE_MAP.get(wire.step.edge);
  useEffect(() => {
    if (view !== "integrated" || !envHighlight) return;
    const pts = [...envHighlight.nodes]
      .map((id) => WIRE_NODE_MAP.get(id))
      .filter((n): n is NonNullable<typeof n> => Boolean(n));
    if (!pts.length) return;
    setFocus({
      x: pts.reduce((s, n) => s + n.x, 0) / pts.length,
      y: pts.reduce((s, n) => s + n.y, 0) / pts.length,
      key: `env-${envHighlight.key}`,
    });
  }, [view, envHighlight]);

  useEffect(() => {
    if (view !== "integrated" || !follow || selected || envOpen || !curEdge) return;
    const a = WIRE_NODE_MAP.get(curEdge.from);
    const b = WIRE_NODE_MAP.get(curEdge.to);
    if (!a || !b) return;
    const long = Math.hypot(b.x - a.x, b.y - a.y) > LONG_EDGE;
    setFocus({
      x: long ? b.x : (a.x + b.x) / 2,
      y: long ? b.y : (a.y + b.y) / 2,
      key: `${wire.scenarioIndex}-${wire.stepIndex}`,
    });
  }, [view, follow, selected, envOpen, curEdge, wire.scenarioIndex, wire.stepIndex]);

  const ctl = useMemo(() => {
    if (view === "gitdiagram")
      return {
        next: git.nextFlow,
        prev: git.prevFlow,
        toggle: () => git.setPlaying((p) => !p),
        playing: git.playing,
      };
    if (view === "integrated")
      return {
        next: wire.nextStep,
        prev: wire.prevStep,
        toggle: () => wire.setPlaying((p) => !p),
        playing: wire.playing,
      };
    return { next, prev, toggle: () => setPlaying((p) => !p), playing };
  }, [view, git, wire, next, prev, playing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setEnvOpen(false);
      }
      if (e.key === "ArrowRight") ctl.next();
      if (e.key === "ArrowLeft") ctl.prev();
      if (e.key === " ") {
        e.preventDefault();
        ctl.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ctl]);

  const activeTrace = step.traces[traceIndex] ?? step.traces[0];
  const flow = resolveFlow(step, activeTrace);

  const networkCaption = flow
    ? `${flow.from} → ${flow.to}`
    : activeTrace
      ? `${LAYER_LABEL[activeTrace.layer]} · ${activeTrace.title}`
      : "NETWORK IDLE";

  const highlights =
    view === "payment"
      ? (PAYMENT_HIGHLIGHTS[step.id] ?? step.highlights ?? [])
      : (step.highlights ?? []);

  const sceneGroups = useMemo(() => {
    const groups: { chapter: string; items: { step: FlowStep; i: number }[] }[] = [];
    scenes.forEach((s, i) => {
      const chapter = s.chapter ?? "";
      const last = groups[groups.length - 1];
      if (last && last.chapter === chapter) last.items.push({ step: s, i });
      else groups.push({ chapter, items: [{ step: s, i }] });
    });
    return groups;
  }, [scenes]);

  const followLink = (link: SceneLink) => {
    if (link.wire) openWire(link.wire);
    else if (link.env !== undefined) openEnv(link.env || null);
    else if (link.scene) {
      const i = scenes.findIndex((s) => s.id === link.scene);
      if (i >= 0) {
        setIndex(i);
        setPlaying(false);
      }
    }
  };

  const drawer = useMemo(() => {
    if (!selected) return null;
    if (view === "integrated") return wireDetail(selected);
    if (view === "gitdiagram") return gitDetail(git.repo, selected);
    return networkDetail(selected);
  }, [selected, view, git.repo]);

  const selectNode = useCallback(
    (id: string | null) => {
      setSelected(id);
      if (id) setEnvOpen(false);
      if (id && view === "integrated") {
        wire.setPlaying(false);
        focusWireNode(id);
      }
    },
    [view, wire, focusWireNode],
  );

  const mapLabel =
    view === "integrated"
      ? "통합 지도 · 노드 클릭 · 드래그 · 휠"
      : view === "gitdiagram"
        ? "지도 · 노드 클릭 · 드래그 · 휠 줌"
        : "네트워크 지도 · 노드 클릭 · 드래그";

  const curPrimary = curEdge?.id ?? null;
  const stepCount = wire.scenario.steps.length;

  return (
    <div className={styles.gameShell}>
      <div className={styles.gridBg} aria-hidden />

      <header className={styles.hudTop}>
        <span className={styles.hudBrand}>MARVEL RUN WIRE</span>
        <nav className={styles.hudNav} aria-label="섹션">
          {(
            [
              ["integrated", "통합"],
              ["architecture", "아키텍처"],
              ["payment", "결제·DB"],
              ["gitdiagram", "GitDiagram"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={view === id ? styles.hudNavOn : undefined}
              onClick={() => switchView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        {view === "gitdiagram" ? (
          <div className={styles.hudTopRight}>
            <button
              type="button"
              className={git.repo === "frontend" ? styles.toolbarOn : undefined}
              onClick={() => {
                git.setRepo("frontend");
                setSelected(null);
              }}
            >
              FE
            </button>
            <button
              type="button"
              className={git.repo === "backend" ? styles.toolbarOn : undefined}
              onClick={() => {
                git.setRepo("backend");
                setSelected(null);
              }}
            >
              BE
            </button>
          </div>
        ) : (
          <div className={styles.hudTopRight} aria-hidden />
        )}
      </header>

      <div className={styles.gameBody}>
        <section className={styles.mapPaneFull} aria-label="아키텍처 지도">
          {view === "integrated" ? (
            <PannableMap
              initialScale={0.85}
              label={mapLabel}
              resetKey="integrated"
              focus={focus}
              rightInset={selected || envOpen ? DRAWER_INSET : 0}
            >
              <WireMap
                width={WIRE_SIZE.w}
                height={WIRE_SIZE.h}
                zones={WIRE_ZONES}
                nodes={WIRE_NODES}
                edges={WIRE_EDGES}
                liveEdges={envHighlight?.edges ?? wire.trailEdges}
                primaryEdgeId={envHighlight ? null : curPrimary}
                activeNodes={envHighlight?.nodes ?? wire.activeNodes}
                focusNodes={envHighlight?.nodes ?? (selected ? EMPTY : wire.focusNodes)}
                offNodes={envHighlight?.off}
                offEdges={envHighlight?.offEdges}
                selectedId={selected}
                playing={wire.playing}
                onSelect={selectNode}
              />
            </PannableMap>
          ) : view === "gitdiagram" ? (
            <PannableMap initialScale={1} label={mapLabel} resetKey={`git-${git.repo}`}>
              <GitDiagramCanvas
                diagram={git.diagram}
                activeEdgeIds={git.activeEdgeIds}
                primaryEdgeId={git.primaryEdgeId}
                playing={git.playing}
                highlightNodes={git.highlightNodes}
                selectedId={selected}
                onSelect={setSelected}
              />
            </PannableMap>
          ) : (
            <PannableMap initialScale={1} label={mapLabel} resetKey={view} center={NETWORK_FIT}>
              <div className={styles.mapCanvasWide2d} onClick={() => setSelected(null)}>
                <NetworkDiagram
                  activePath={activeSet}
                  flowFrom={flow?.from}
                  flowTo={flow?.to}
                  playing={playing}
                  pulseLabel={networkCaption}
                />
                <div className={styles.networkNodes}>
                  {NODES.map((node) => {
                    const pos = NODE_LAYOUT[node.id];
                    if (!pos) return null;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        className={`${styles.networkNodeWrap} ${
                          selected === node.id ? styles.nodeSelected : ""
                        }`}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(selected === node.id ? null : node.id);
                        }}
                        aria-label={`${node.label} 자세히 보기`}
                      >
                        <NodeCard
                          label={node.label}
                          sub={node.sub}
                          accent={node.accent}
                          icon={node.icon}
                          active={activeSet.has(node.id) || selected === node.id}
                          pulse={
                            (step.envHighlight === "frontend" && node.id === "env-fe") ||
                            ((step.envHighlight === "backend" ||
                              step.envHighlight === "both") &&
                              node.id === "env-be")
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </PannableMap>
          )}
        </section>

        <aside
          className={`${styles.storyFloat} ${storyView && step.table ? styles.storyWide : ""}`}
          aria-live="polite"
        >
          {view === "integrated" ? (
            <>
              <p className={styles.storyKicker}>통합 지도 · FE ↔ BE ↔ Toss ↔ DB</p>
              <div className={styles.scenarioChips}>
                {wire.scenarios.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={i === wire.scenarioIndex ? styles.chipOn : undefined}
                    onClick={() => {
                      wire.selectScenario(i);
                      setSelected(null);
                    }}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <p className={styles.storyMeta}>{wire.scenario.summary}</p>
              <div className={styles.stepBar}>
                <span style={{ width: `${((wire.stepIndex + 1) / stepCount) * 100}%` }} />
              </div>
              <div className={styles.storyTrace}>
                <p className={styles.storyTraceLabel}>
                  STEP {wire.stepIndex + 1}/{stepCount}
                  {curEdge?.label ? ` · ${curEdge.label}` : ""}
                </p>
                <p className={styles.storyTraceTitle}>{wire.step.title}</p>
                <p className={styles.storyTraceDetail}>{wire.step.detail}</p>
              </div>
              <ol className={styles.stepList}>
                {wire.scenario.steps.map((s, i) => (
                  <li key={`${s.edge}-${i}`}>
                    <button
                      type="button"
                      className={
                        i === wire.stepIndex
                          ? styles.stepNow
                          : i < wire.stepIndex
                            ? styles.stepDone
                            : undefined
                      }
                      onClick={() => {
                        wire.setStepIndex(i);
                        wire.setPlaying(false);
                        setSelected(null);
                      }}
                    >
                      <b>{i + 1}</b>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ol>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={follow}
                  onChange={(e) => setFollow(e.target.checked)}
                />
                카메라가 현재 단계 따라가기
              </label>
              <p className={styles.clickHint}>
                지도의 노드를 클릭하면 실제 파일·엔드포인트·ENV와 연결 관계를 볼 수 있어요.
              </p>
              <button
                type="button"
                className={`${styles.envBtn} ${envOpen ? styles.envBtnOn : ""}`}
                onClick={() => (envOpen ? setEnvOpen(false) : openEnv(null))}
              >
                <WireIcon name="key" size={14} />
                ENV 스위치 · on/off · 0/1/3 · 모드 전환
              </button>
              <p className={styles.wireLegend}>
                {EDGE_LEGEND.map((l) => (
                  <span key={l.kind} style={{ ["--c" as string]: l.color }}>
                    <i />
                    {l.label}
                  </span>
                ))}
              </p>
            </>
          ) : view === "gitdiagram" ? (
            <>
              <p className={styles.storyKicker}>
                GitDiagram · {git.repo === "frontend" ? "Frontend" : "Backend"}
              </p>
              <h1 className={styles.storyTitle}>{git.flow.title}</h1>
              <p className={styles.storyBody}>{git.flow.summary}</p>
              <p className={styles.clickHint}>
                노드를 클릭하면 실제 코드 파일과 통합 지도 위치를 볼 수 있어요.
              </p>
              <a
                href={git.diagram.gitdiagramUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.gitBadgeLink}
              >
                <WireIcon name="layers" size={14} />
                원본 GitDiagram ↗
              </a>
            </>
          ) : (
            <>
              <p className={styles.storyKicker}>{step.reelTitle}</p>
              <h1 className={styles.storyTitle}>{step.headline}</h1>
              <p className={styles.storyBody}>{step.body}</p>
              {highlights.length > 0 ? <HighlightList items={highlights} /> : null}

              <div className={styles.storyTrace}>
                <p className={styles.storyTraceLabel}>
                  지금 단계 · {LAYER_LABEL[activeTrace.layer]}
                </p>
                <p className={styles.storyTraceTitle}>{activeTrace.title}</p>
                <p className={styles.storyTraceDetail}>{activeTrace.detail}</p>
              </div>

              {step.table || step.stacks ? (
                <details key={step.id} className={styles.storyCodeFold} open>
                  <summary>{step.table?.caption ?? "구성 · 표"}</summary>
                  {step.table ? (
                    <div className={styles.sceneTableWrap}>
                      <table className={styles.sceneTable}>
                        <thead>
                          <tr>
                            {step.table.head.map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {step.table.rows.map((row, r) => (
                            <tr key={r}>
                              {row.map((cell, c) => (
                                <td key={c}>
                                  {cell.split(/(?<=[_./])/).map((part, k) => (
                                    <Fragment key={k}>
                                      {k > 0 ? <wbr /> : null}
                                      {part}
                                    </Fragment>
                                  ))}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {step.stacks?.map((g) => (
                    <div
                      key={g.title}
                      className={styles.stackGroup}
                      style={{ ["--c" as string]: g.accent }}
                    >
                      <p>{g.title}</p>
                      <ul>
                        {g.items.map((it) => (
                          <li key={it.name}>
                            <b>{it.name}</b>
                            <span>{it.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </details>
              ) : null}

              {step.links?.length ? (
                <div className={styles.sceneLinks}>
                  {step.links.map((l) => (
                    <button key={l.label} type="button" onClick={() => followLink(l)}>
                      <WireIcon
                        name={l.env !== undefined ? "key" : l.scene ? "layers" : "server"}
                        size={12}
                      />
                      {l.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <details className={styles.storyCodeFold}>
                <summary>코드 · {step.code.file}</summary>
                <pre className={styles.code}>
                  {step.code.lines.map((line, i) => (
                    <code key={i}>{line || " "}</code>
                  ))}
                </pre>
              </details>

              {view === "architecture" && index === ARCH_STEPS.length - 1 ? (
                <button
                  type="button"
                  className={styles.bridgeBtn}
                  onClick={() => switchView("payment")}
                >
                  결제·승인 흐름 이어 보기 →
                </button>
              ) : null}

              <ol className={styles.stepList}>
                {sceneGroups.map((g) => (
                  <li key={g.chapter}>
                    {g.chapter ? <p className={styles.sceneChapter}>{g.chapter}</p> : null}
                    <ol>
                      {g.items.map(({ step: s, i }) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className={
                              i === index ? styles.stepNow : i < index ? styles.stepDone : undefined
                            }
                            onClick={() => {
                              setIndex(i);
                              setPlaying(false);
                            }}
                          >
                            <b>{i + 1}</b>
                            {s.headline}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            </>
          )}

          <footer className={styles.storyControls}>
            <button type="button" onClick={ctl.prev} aria-label="이전">
              ←
            </button>
            <button type="button" className={styles.playBtn} onClick={ctl.toggle}>
              {ctl.playing ? "일시정지" : "재생"}
            </button>
            <button type="button" onClick={ctl.next} aria-label="다음">
              →
            </button>
          </footer>

          {view !== "integrated" ? (
            <div className={styles.progress}>
              {(view === "gitdiagram"
                ? git.diagram.flows.map((f) => ({ id: f.id, label: f.title }))
                : scenes.map((s) => ({ id: s.id, label: s.reelTitle }))
              ).map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.dot} ${
                    i === (view === "gitdiagram" ? git.flowIndex : index) ? styles.dotOn : ""
                  }`}
                  onClick={() => (view === "gitdiagram" ? git.setFlowIndex(i) : setIndex(i))}
                  aria-label={s.label}
                />
              ))}
            </div>
          ) : null}
          {storyView ? <p className={styles.storyFootnote}>{FLOW_LEGEND[0]}</p> : null}
        </aside>

        {envOpen && view === "integrated" ? (
          <EnvSwitchPanel
            switchId={envId}
            picked={envPicked}
            onOpen={setEnvId}
            onPick={(id, value) => setEnvPicked((p) => ({ ...p, [id]: value }))}
            onClose={() => setEnvOpen(false)}
          />
        ) : drawer ? (
          <NodeDrawer
            content={drawer}
            onClose={() => setSelected(null)}
            onSelectLink={(id) => selectNode(id)}
            onSelectSwitch={(id) => openEnv(id)}
            onOpenWire={view === "integrated" ? undefined : openWire}
            onSelectScenario={
              view === "integrated"
                ? (i) => {
                    wire.selectScenario(i);
                    wire.setPlaying(true);
                    setSelected(null);
                  }
                : undefined
            }
          />
        ) : null}
      </div>
    </div>
  );
}
