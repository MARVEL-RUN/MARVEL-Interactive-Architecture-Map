"use client";

import { WireIcon, type IconName } from "@/components/WireIcon";
import styles from "./wire.module.css";

export type DrawerLink = { id: string; label: string; relation: string };

export type DrawerContent = {
  title: string;
  kicker: string;
  sub?: string;
  icon: IconName;
  accent: string;
  summary: string;
  sections: { label: string; items: string[]; mono?: boolean }[];
  links: DrawerLink[];
  scenarios?: { index: number; title: string }[];
  switches?: { id: string; title: string }[];
  /** Integrated-map node to jump to from other tabs. */
  wireId?: string;
  externalUrl?: string;
};

type Props = {
  content: DrawerContent;
  onClose: () => void;
  onSelectLink: (id: string) => void;
  onOpenWire?: (wireId: string) => void;
  onSelectScenario?: (index: number) => void;
  onSelectSwitch?: (id: string) => void;
};

export function NodeDrawer({
  content,
  onClose,
  onSelectLink,
  onOpenWire,
  onSelectScenario,
  onSelectSwitch,
}: Props) {
  return (
    <aside
      className={styles.drawer}
      style={{ ["--accent" as string]: content.accent }}
      aria-label={`${content.title} 상세`}
    >
      <header className={styles.drawerHead}>
        <span className={styles.nodeTile}>
          <WireIcon name={content.icon} />
        </span>
        <div className={styles.drawerTitles}>
          <p className={styles.storyKicker}>{content.kicker}</p>
          <h2 className={styles.drawerTitle}>{content.title}</h2>
          {content.sub ? <p className={styles.drawerSub}>{content.sub}</p> : null}
        </div>
        <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </header>

      <p className={styles.storyBody}>{content.summary}</p>

      {content.sections.map((s) =>
        s.items.length ? (
          <section key={s.label} className={styles.drawerSection}>
            <h3>{s.label}</h3>
            <ul className={s.mono ? styles.drawerMono : undefined}>
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null,
      )}

      {content.links.length ? (
        <section className={styles.drawerSection}>
          <h3>연결</h3>
          <div className={styles.drawerLinks}>
            {content.links.map((l) => (
              <button key={`${l.relation}-${l.id}`} type="button" onClick={() => onSelectLink(l.id)}>
                <span>{l.relation}</span>
                {l.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {content.scenarios?.length && onSelectScenario ? (
        <section className={styles.drawerSection}>
          <h3>등장하는 시나리오</h3>
          <div className={styles.drawerChips}>
            {content.scenarios.map((s) => (
              <button key={s.index} type="button" onClick={() => onSelectScenario(s.index)}>
                {s.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {content.switches?.length && onSelectSwitch ? (
        <section className={styles.drawerSection}>
          <h3>영향 주는 ENV 스위치</h3>
          <div className={styles.drawerChips}>
            {content.switches.map((s) => (
              <button key={s.id} type="button" onClick={() => onSelectSwitch(s.id)}>
                ⚙ {s.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.drawerActions}>
        {content.wireId && onOpenWire ? (
          <button type="button" onClick={() => onOpenWire(content.wireId!)}>
            통합 지도에서 보기 →
          </button>
        ) : null}
        {content.externalUrl ? (
          <a href={content.externalUrl} target="_blank" rel="noreferrer">
            원본 GitDiagram ↗
          </a>
        ) : null}
      </div>
    </aside>
  );
}
