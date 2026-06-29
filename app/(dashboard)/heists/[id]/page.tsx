"use client";

import { use } from "react";
import Link from "next/link";
import { useHeist } from "@/hooks/useHeist";
import styles from "./heist-details.module.css";

function getCountdown(deadline: Date): string {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  return `${hours}h ${minutes}m remaining`;
}

function isUrgent(deadline: Date): boolean {
  return deadline.getTime() - Date.now() < 6 * 60 * 60 * 1000;
}

function HeistDetailsSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonBadge} />
      <div className={styles.skeletonSection} />
      <div className={styles.skeletonSection} />
    </div>
  );
}

export default function HeistDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { heist, loading } = useHeist(id);

  if (loading)
    return (
      <div className="page-content">
        <HeistDetailsSkeleton />
      </div>
    );

  if (!heist)
    return (
      <div className="page-content">
        <div className={styles.notFound}>
          <p>Heist not found.</p>
          <Link href="/heists" className={styles.back}>
            ← Back to heists
          </Link>
        </div>
      </div>
    );

  const countdown = getCountdown(heist.deadline);
  const urgent = isUrgent(heist.deadline);

  return (
    <div className="page-content">
      <div className={styles.container}>
        <Link href="/heists" className={styles.back}>
          ← Back to heists
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>{heist.title}</h1>
          <span
            className={`${styles.countdown} ${urgent ? styles.countdownUrgent : ""}`}
          >
            {countdown}
          </span>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mission Brief</h2>
          <p className={styles.description}>{heist.description}</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Personnel</h2>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Assigned To</span>
              <span className={styles.metaValue}>
                {heist.assignedToCodename}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created By</span>
              <span className={styles.metaValue}>
                {heist.createdByCodename}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Deadline</span>
              <span className={styles.metaValue}>
                {heist.deadline.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}{" "}
                {heist.deadline.toLocaleTimeString(undefined, {
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created</span>
              <span className={styles.metaValue}>
                {heist.createdAt.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
