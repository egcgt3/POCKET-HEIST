"use client";

import { useHeists } from "@/hooks/useHeists";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import ExpiredHeistCard from "@/components/ExpiredHeistCard";
import ExpiredHeistCardSkeleton from "@/components/ExpiredHeistCardSkeleton";
import styles from "./heists.module.css";

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists("active");
  const { heists: assignedHeists, loading: assignedLoading } =
    useHeists("assigned");
  const { heists: expiredHeists, loading: expiredLoading } =
    useHeists("expired");
  const loading = activeLoading || assignedLoading;

  return (
    <div className="page-content">
      <div className={styles.grid}>
        {loading ? (
          <>
            <HeistCardSkeleton />
            <HeistCardSkeleton />
            <HeistCardSkeleton />
          </>
        ) : (
          <>
            {activeHeists.map((h) => (
              <HeistCard key={h.id} {...h} mode="active" />
            ))}
            {assignedHeists.map((h) => (
              <HeistCard key={h.id} {...h} mode="assigned" />
            ))}
          </>
        )}
      </div>
      {(expiredLoading || expiredHeists.length > 0) && (
        <section
          className={styles.pastSection}
          aria-labelledby="past-heists-heading"
        >
          <h2 id="past-heists-heading">Past Heists</h2>
          <div
            className={styles.grid}
            aria-busy={expiredLoading}
            aria-live="polite"
            aria-label="Past heists"
          >
            {expiredLoading ? (
              <>
                <ExpiredHeistCardSkeleton />
                <ExpiredHeistCardSkeleton />
                <ExpiredHeistCardSkeleton />
              </>
            ) : (
              expiredHeists.map((h) => (
                <ExpiredHeistCard
                  key={h.id}
                  {...h}
                  finalStatus={h.finalStatus as "success" | "failure"}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
