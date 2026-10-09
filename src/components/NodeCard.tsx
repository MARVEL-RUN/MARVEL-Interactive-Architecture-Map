import { Fragment } from "react";
import { WireIcon, type IconName } from "@/components/WireIcon";
import styles from "./wire.module.css";

type Props = {
  label: string;
  sub?: string;
  accent: string;
  icon: IconName;
  active: boolean;
  pulse?: boolean;
  external?: boolean;
};

export function NodeCard({
  label,
  sub,
  accent,
  icon,
  active,
  pulse,
  external,
}: Props) {
  return (
    <div
      className={`${styles.node} ${active ? styles.nodeActive : ""} ${
        pulse ? styles.nodeEnv : ""
      } ${external ? styles.nodeExternal : ""}`}
      style={{ ["--accent" as string]: accent }}
    >
      <span className={styles.nodeTile}>
        <WireIcon name={icon} />
      </span>
      <div className={styles.nodeText}>
        <p className={styles.nodeLabel}>
          {label.split(/(?<=[a-z])(?=[A-Z])/).map((part, i) => (
            <Fragment key={i}>
              {i > 0 ? <wbr /> : null}
              {part}
            </Fragment>
          ))}
        </p>
        {sub ? <p className={styles.nodeSub}>{sub}</p> : null}
      </div>
    </div>
  );
}
