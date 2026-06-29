import styles from "./Badge.module.css";

type BadgeVariant = "active" | "assigned" | "success" | "failure";

interface BadgeProps {
  variant: BadgeVariant;
  ariaLabel?: string;
}

const VARIANT_LABELS: Record<BadgeVariant, string> = {
  active: "Active",
  assigned: "Assigned",
  success: "Mission Complete",
  failure: "Mission Failed",
};

export default function Badge({ variant, ariaLabel }: BadgeProps) {
  const label = VARIANT_LABELS[variant];
  if (!label) return null;

  return (
    <span
      className={styles.badge}
      data-variant={variant}
      aria-label={ariaLabel}
    >
      {label}
    </span>
  );
}
