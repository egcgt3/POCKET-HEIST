import styles from "./HeistCardSkeleton.module.css";

export default function HeistCardSkeleton() {
  return (
    <article className={styles.card}>
      <div className={styles.lineShort} />
      <div className={styles.lineXShort} />
      <div className={styles.meta}>
        <div className={styles.lineMed} />
        <div className={styles.line} />
      </div>
    </article>
  );
}
