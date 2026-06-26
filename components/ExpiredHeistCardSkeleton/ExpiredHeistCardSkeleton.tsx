import styles from "./ExpiredHeistCardSkeleton.module.css";

export default function ExpiredHeistCardSkeleton() {
  return (
    <article aria-hidden="true" className={styles.card}>
      <div className={styles.lineShort} />
      <div className={styles.lineXShort} />
      <div className={styles.meta}>
        <div className={styles.lineMed} />
        <div className={styles.line} />
      </div>
    </article>
  );
}
