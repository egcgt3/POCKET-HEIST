import Link from "next/link";
import Badge from "@/components/Badge";
import styles from "./ExpiredHeistCard.module.css";

interface ExpiredHeistCardProps {
  id: string;
  title: string;
  deadline: Date;
  assignedToCodename: string;
  finalStatus: "success" | "failure";
}

export default function ExpiredHeistCard({
  id,
  title,
  deadline,
  assignedToCodename,
  finalStatus,
}: ExpiredHeistCardProps) {
  return (
    <article
      className={styles.card}
      aria-labelledby={`heist-expired-title-${id}`}
    >
      <Link
        href={`/heists/${id}`}
        id={`heist-expired-title-${id}`}
        className={styles.title}
      >
        {title}
      </Link>
      <Badge variant={finalStatus} />
      <div className={styles.meta}>
        <span>
          Expired{" "}
          {deadline.toLocaleDateString("en-US", { dateStyle: "medium" })}
        </span>
        <span className={styles.crew}>
          <span className={styles.srOnly}>Assigned to: </span>
          {assignedToCodename || "No crew assigned"}
        </span>
      </div>
    </article>
  );
}
