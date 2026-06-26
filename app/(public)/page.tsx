import Link from "next/link";
import { Clock8 } from "lucide-react";
import styles from "./splash.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.wordmark}>
        P
        <Clock8
          className={styles.wordmarkIcon}
          strokeWidth={2.75}
          aria-hidden
        />
        cket Heist
      </div>

      <p className={styles.eyebrow}>◆ Mission Briefing</p>

      <h1 className={styles.headline}>
        Someone in this
        <br />
        office is already
        <br />
        planning your heist.
      </h1>

      <p className={styles.body}>
        Pocket Heist turns your workplace into a playground for micro-missions
        and petty corporate chaos. Accept assignments, pull off heists, and find
        out who&apos;s really running things around here.
      </p>

      <Link href="/signup" className={styles.cta}>
        Accept the mission
      </Link>

      <p className={styles.alt}>
        Already have a codename? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
