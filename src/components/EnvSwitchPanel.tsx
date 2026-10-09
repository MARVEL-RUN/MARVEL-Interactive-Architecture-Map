"use client";

import { WireIcon } from "@/components/WireIcon";
import { WIRE_NODE_MAP } from "@/data/integrated";
import { ENV_SWITCHES, ENV_SWITCH_MAP } from "@/data/switches";
import styles from "./wire.module.css";

type Props = {
  /** null shows the list of all switches. */
  switchId: string | null;
  picked: Record<string, string>;
  onOpen: (id: string | null) => void;
  onPick: (id: string, value: string) => void;
  onClose: () => void;
};

export function EnvSwitchPanel({ switchId, picked, onOpen, onPick, onClose }: Props) {
  const sw = switchId ? ENV_SWITCH_MAP.get(switchId) : undefined;

  return (
    <aside
      className={styles.drawer}
      style={{ ["--accent" as string]: "#fbbf24" }}
      aria-label="ENV 스위치"
    >
      <header className={styles.drawerHead}>
        <span className={styles.nodeTile}>
          <WireIcon name="key" />
        </span>
        <div className={styles.drawerTitles}>
          <p className={styles.storyKicker}>
            ENV 스위치{sw ? ` · ${sw.side === "frontend" ? "프론트 빌드" : "백엔드 설정"}` : ""}
          </p>
          <h2 className={styles.drawerTitle}>{sw ? sw.title : "값을 바꾸면 무엇이 달라질까"}</h2>
          {sw ? <p className={styles.drawerSub}>{sw.name}</p> : null}
        </div>
        <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </header>

      {!sw ? (
        <>
          <p className={styles.storyBody}>
            env·설정값으로 켜고 끄거나 모드를 바꾸는 것들입니다. 하나를 고르면 값별 동작과 지도에서
            영향받는 곳을 보여 줍니다.
          </p>
          <div className={styles.switchList}>
            {ENV_SWITCHES.map((s) => {
              const value = s.values.find((v) => v.value === (picked[s.id] ?? s.fallback));
              const isOff = Boolean(value?.off?.length);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={isOff ? styles.switchItemOff : undefined}
                  onClick={() => onOpen(s.id)}
                >
                  <span className={styles.switchSide} data-side={s.side}>
                    {s.side === "frontend" ? "FE" : "BE"}
                  </span>
                  <span className={styles.switchText}>
                    <b>
                      {s.title}
                      {isOff ? <em className={styles.offTag}>OFF</em> : null}
                    </b>
                    <code>
                      {s.name} = {s.values.map((v) => v.value || "∅").join(" | ")}
                    </code>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <SwitchDetail
          key={sw.id}
          id={sw.id}
          picked={picked[sw.id] ?? sw.fallback}
          onPick={(v) => onPick(sw.id, v)}
          onBack={() => onOpen(null)}
        />
      )}
    </aside>
  );
}

function NodeChips({ title, ids, off }: { title: string; ids: string[]; off?: boolean }) {
  return (
    <div className={styles.switchChips}>
      <span>{title}</span>
      {ids.map((id) => (
        <em key={id} className={off ? styles.chipOff : styles.chipOn}>
          {WIRE_NODE_MAP.get(id)?.label ?? id}
        </em>
      ))}
    </div>
  );
}

function SwitchDetail({
  id,
  picked,
  onPick,
  onBack,
}: {
  id: string;
  picked: string;
  onPick: (v: string) => void;
  onBack: () => void;
}) {
  const sw = ENV_SWITCH_MAP.get(id)!;
  const current = sw.values.find((v) => v.value === picked) ?? sw.values[0];

  return (
    <>
      <p className={styles.storyBody}>{sw.summary}</p>

      <section className={styles.drawerSection}>
        <h3>값 고르기</h3>
        <div className={styles.switchValues} role="radiogroup" aria-label={sw.name}>
          {sw.values.map((v) => (
            <button
              key={v.value}
              type="button"
              role="radio"
              aria-checked={v.value === current.value}
              className={v.value === current.value ? styles.switchValueOn : undefined}
              onClick={() => onPick(v.value)}
            >
              {v.label}
              {v.value === sw.fallback ? <small>기본</small> : null}
            </button>
          ))}
        </div>
        <p className={`${styles.switchEffect} ${current.off?.length ? styles.switchEffectOff : ""}`}>
          {current.effect}
        </p>
        {current.off?.length ? <NodeChips title="꺼지는 곳" ids={current.off} off /> : null}
        {current.nodes?.length ? <NodeChips title="켜지는 곳" ids={current.nodes} /> : null}
      </section>

      <section className={styles.drawerSection}>
        <h3>지금 설정된 곳</h3>
        <ul className={styles.drawerMono}>
          {sw.current.map((c) => (
            <li key={c.where}>
              {c.where} → <b>{c.value}</b>
            </li>
          ))}
        </ul>
      </section>

      {sw.notes?.length ? (
        <section className={styles.drawerSection}>
          <h3>주의</h3>
          <ul>
            {sw.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.drawerSection}>
        <h3>파일</h3>
        <ul className={styles.drawerMono}>
          {sw.files.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <div className={styles.drawerActions}>
        <button type="button" onClick={onBack}>
          ← 스위치 목록
        </button>
      </div>
    </>
  );
}
