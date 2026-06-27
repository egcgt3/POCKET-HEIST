# Implementation Plan: `expired-heist-card`

## Context

The `/heists` page currently shows only active and assigned heists. Users have no visibility into heists that have passed their deadline, even though the `useHeists("expired")` hook and Firestore query for expired heists already exist. This plan adds an `ExpiredHeistCard` and `ExpiredHeistCardSkeleton` component pair rendered below the existing grid, giving users a record of past heist outcomes.

A key design decision: the `Heist` type already carries a `finalStatus: "success" | "failure" | null` field. Expired cards will surface this outcome through distinct badge colours (green "Success", red "Failure") rather than a generic "Expired" label, making the outcome immediately scannable.

---

## New Files

### 1. `components/ExpiredHeistCard/ExpiredHeistCard.tsx`

Props interface (self-contained in this file):

```
ExpiredHeistCardProps {
  id: string
  title: string
  deadline: Date
  assignedToCodename: string
  finalStatus: "success" | "failure"
}
```

Structure mirrors `HeistCard` exactly:
- Title rendered as a Next.js `<Link href="/heists/${id}">` using `styles.title`
- Badge `<span>` uses `data-status` attribute to drive CSS variants:
  - `"success"` → "Mission Complete" text, `--color-success` green
  - `"failure"` → "Mission Failed" text, `--color-error` red
- `<div className={styles.meta}>` with deadline (`Expired {deadline.toLocaleDateString()}`) and crew codename (fallback: "No crew assigned")
- Overall card uses a muted surface so it reads as visually secondary to active cards

### 2. `components/ExpiredHeistCard/ExpiredHeistCard.module.css`

Opens with `@reference "../../app/globals.css"`.

- `.card` — same shell as `HeistCard` (`rounded-xl`, `p-6`, `flex flex-col gap-3`) but with `opacity: 0.75` or a slightly darker/muted `background-color` to visually de-emphasise expired cards
- `.title` — `font-semibold text-base leading-snug`, color `--color-body` (muted, not white) with no hover effect
- `.badge` — same pill shape as `HeistCard` badge (`text-xs font-semibold rounded-full self-start`, padding `0.125rem 0.5rem`)
  - `[data-status="success"]` — `color: var(--color-success)`, faint green background (`rgba(5, 223, 114, 0.1)`)
  - `[data-status="failure"]` — `color: var(--color-error)`, faint red background (`rgba(255, 100, 103, 0.1)`)
- `.meta` — same as `HeistCard`: `flex flex-col gap-1 text-sm`, `color: var(--color-body)`
- `.crew` — `font-medium`

### 3. `components/ExpiredHeistCard/index.ts`

`export { default } from "./ExpiredHeistCard"`

### 4. `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.tsx`

Identical DOM structure to `HeistCardSkeleton` — no props, same shimmer placeholder pattern.

### 5. `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.module.css`

Opens with `@reference "../../app/globals.css"`.

Copy the `@keyframes shimmer`, `.card`, and line-width classes from `HeistCardSkeleton.module.css` verbatim. No visual differences needed between skeleton variants — both use the same shimmer.

### 6. `components/ExpiredHeistCardSkeleton/index.ts`

`export { default } from "./ExpiredHeistCardSkeleton"`

### 7. `tests/components/ExpiredHeistCard.test.tsx`

No Firebase mocks needed — `ExpiredHeistCard` is purely presentational.

Mock `next/link` with a plain `<a>` (same pattern as `tests/components/HeistCard.test.tsx`).

Fixture:
```
{
  id: "heist-2",
  title: "Rob the Vending Machine",
  deadline: new Date("2020-01-01"),
  assignedToCodename: "SilverFox",
  finalStatus: "success"
}
```

4 test cases:
1. Renders title, formatted deadline, and "Mission Complete" badge from props
2. Renders title as a link to `/heists/heist-2`
3. Renders "Mission Failed" badge when `finalStatus` is `"failure"`
4. `ExpiredHeistCardSkeleton` renders without crashing

---

## Files to Modify

### `app/(dashboard)/heists/page.tsx`

1. Add `useHeists("expired")` call: `const { heists: expiredHeists, loading: expiredLoading } = useHeists("expired")`
2. Import `ExpiredHeistCard` and `ExpiredHeistCardSkeleton`
3. Below the existing `<div className={styles.grid}>`, add a new `<section>` containing:
   - A heading (e.g. `<h2>Past Heists</h2>`) — styled via the existing global `h2` token
   - A second `<div className={styles.grid}>` for expired cards
   - When `expiredLoading`: 3× `<ExpiredHeistCardSkeleton />`
   - When not loading and `expiredHeists.length > 0`: map expired heists to `<ExpiredHeistCard>`, spreading `h` and passing `finalStatus={h.finalStatus ?? "failure"}` (null-guard since the hook already filters for non-null, but TypeScript needs the assertion)
   - When not loading and `expiredHeists.length === 0`: render nothing (no empty state per spec)

---

## Props Mapping from `Heist` Type

| Prop | Source | Notes |
|------|--------|-------|
| `id` | `heist.id` | Firestore document ID |
| `title` | `heist.title` | |
| `deadline` | `heist.deadline` | Already a `Date` after converter |
| `assignedToCodename` | `heist.assignedToCodename` | Fallback handled in component |
| `finalStatus` | `heist.finalStatus` | Hook guarantees non-null; guard with `?? "failure"` for TypeScript |

---

## Critical Files

- `components/HeistCard/HeistCard.tsx` — reference for component structure
- `components/HeistCard/HeistCard.module.css` — reference for CSS patterns and token usage
- `components/HeistCardSkeleton/HeistCardSkeleton.module.css` — reference for shimmer keyframe
- `app/(dashboard)/heists/page.tsx` — modified to add expired section
- `types/firestore/heist.ts` — `Heist` type and `finalStatus` field
- `hooks/useHeists.ts` — `useHeists("expired")` already implemented, no changes needed
- `app/globals.css` — `--color-success`, `--color-error`, `--color-body` tokens

---

## Verification

```bash
npm test -- tests/components/ExpiredHeistCard.test.tsx --run
npm run build
npm run dev
```

Manual checks on `http://localhost:3000/heists`:
1. Active/assigned grid renders as before — no regression
2. "Past Heists" section appears below with expired cards in the same 3-column grid
3. Success cards show green "Mission Complete" badge; failure cards show red "Mission Failed" badge
4. Clicking a title navigates to `/heists/:id` without error
5. With no expired heists, the past heists section is hidden entirely
6. Skeleton cards appear while the expired query is loading
