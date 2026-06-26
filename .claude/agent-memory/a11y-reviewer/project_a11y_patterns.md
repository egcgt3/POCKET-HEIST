---
name: project-a11y-patterns
description: Recurring accessibility antipatterns and established conventions observed across component audits in this codebase
metadata:
  type: project
---

## Recurring antipatterns found (as of first audit — ExpiredHeistCard / ExpiredHeistCardSkeleton)

**No global focus ring styles exist.** `app/globals.css` has zero `:focus`, `:focus-visible`, or `outline` declarations. Every CSS module that removes `text-decoration` from a link (or otherwise overrides default focus cues) must define its own `:focus-visible` rule, or it will silently leave links with browser-default-only focus indicators.

**Why:** The globals.css only sets color tokens, typography, and layout helpers — focus styles were never added at the base level.

**How to apply:** Flag any `.module.css` that omits `:focus-visible` on interactive elements as a Major/Blocker. Recommend they use `var(--color-primary)` for the outline color, matching the existing `.btn:hover` usage of `--color-secondary`.

---

**Skeleton/loading components have no accessibility affordance.** The pattern used so far renders skeletons as bare `<article>` or structural HTML elements with empty `<div>` children and no ARIA attributes. Screen readers encounter empty, meaningless elements.

**Why:** Skeleton components are purely visual — the convention in this project does not yet include ARIA treatment.

**How to apply:** Every skeleton component should have `aria-hidden="true"` on its root, AND the parent grid/container that swaps between skeleton and real content should carry `aria-busy={loading}` + `aria-live="polite"` to announce the transition.

---

**`<article>` elements are used for cards without accessible names.** The card pattern in this codebase wraps content in `<article>` but does not add `aria-labelledby` pointing to the primary title link. When multiple cards are on the page, screen reader landmark/article navigation provides no differentiation.

**How to apply:** When auditing card components, check for `aria-labelledby={`${prefix}-${id}`}` on `<article>` and a matching `id` on the primary link/heading inside.

---

**`opacity: 0.75` on entire card elements causes contrast failures.** Applied to `.card` in both `ExpiredHeistCard` and `ExpiredHeistCardSkeleton`. After CSS compositing against the dark page background (`--color-dark: #030712`), the `--color-error: #FF6467` badge text on its semi-transparent badge background drops from ~5.5:1 to ~3.8:1 — below the 4.5:1 WCAG 1.4.3 AA threshold for 12px (`text-xs`) text. Body text (#99A1AF) drops to ~4.5:1 (borderline pass).

**How to apply:** When a card uses opacity on the whole element, always spot-check badge/status colors specifically — bright semantic colors over semi-transparent tinted backgrounds are most at risk.

---

**Shimmer animations do not include `prefers-reduced-motion` overrides.** The `ExpiredHeistCardSkeleton` shimmer is a 1.6s infinite opacity animation with no `@media (prefers-reduced-motion: reduce)` block. This is a known gap to flag in any skeleton/loading component.

---

**Tests do not cover accessibility assertions.** The `ExpiredHeistCard.test.tsx` uses `getByRole("link")` (good) but has no assertions for: keyboard focusability, aria-label on the article, aria-hidden on the skeleton, or live region behavior. Future audits should include RTL test recommendations to close this gap.
