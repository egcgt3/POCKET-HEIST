"use client";

import { useHeists } from "@/hooks/useHeists";
import type { Heist } from "@/types/firestore";

function HeistList({
  heists,
  loading,
  emptyMessage,
}: {
  heists: Heist[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) return <p>Loading…</p>;
  if (heists.length === 0) return <p>{emptyMessage}</p>;
  return (
    <ul>
      {heists.map((h) => (
        <li key={h.id}>{h.title}</li>
      ))}
    </ul>
  );
}

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists("active");
  const { heists: assignedHeists, loading: assignedLoading } =
    useHeists("assigned");
  const { heists: expiredHeists, loading: expiredLoading } =
    useHeists("expired");

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        <HeistList
          heists={activeHeists}
          loading={activeLoading}
          emptyMessage="No active heists."
        />
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        <HeistList
          heists={assignedHeists}
          loading={assignedLoading}
          emptyMessage="No heists assigned."
        />
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        <HeistList
          heists={expiredHeists}
          loading={expiredLoading}
          emptyMessage="No expired heists."
        />
      </div>
    </div>
  );
}
