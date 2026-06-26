"use client";

import { useHeists } from "@/hooks/useHeists";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import styles from "./heists.module.css";

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists("active");
  const { heists: assignedHeists, loading: assignedLoading } =
    useHeists("assigned");
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
    </div>
  );
}
