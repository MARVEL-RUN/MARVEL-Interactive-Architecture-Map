import styles from "./wire.module.css";

export function HighlightList({ items }: { items: string[] }) {
  return (
    <ul className={styles.highlightList}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
