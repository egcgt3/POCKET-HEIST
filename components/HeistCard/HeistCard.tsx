import Link from "next/link";
import styles from "./HeistCard.module.css";

interface HeistCardProps {
  id: string;
  title: string;
  deadline: Date;
  assignedToCodename: string;
  mode: "active" | "assigned";
}

export default function HeistCard({
  id,
  title,
  deadline,
  assignedToCodename,
  mode,
}: HeistCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/heists/${id}`} className={styles.title}>
        {title}
      </Link>
      <span className={styles.badge} data-mode={mode}>
        {mode === "active" ? "Active" : "Assigned"}
      </span>
      <div className={styles.meta}>
        <span>Due {deadline.toLocaleDateString()}</span>
        <span className={styles.crew}>
          {assignedToCodename || "No crew assigned"}
        </span>
      </div>
    </article>
  );
}
