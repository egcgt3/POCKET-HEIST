# Implementation Plan: `heist-card-component`

## Context

The `/heists` page currently renders three separate sections (Active, Assigned, Expired) using a basic `<ul>/<li>` pattern. This plan replaces that layout with a unified 3-column card grid showing only `active` and `assigned` heists. Two new components are added — `HeistCard` and `HeistCardSkeleton` — following the existing three-file component convention. The `/heists/[id]` route already exists as a working shell and requires no changes.

---

## New Files

### 1. `components/HeistCard/HeistCard.tsx`

A `"use client"` component accepting a `HeistCardProps` interface (defined in this file). Renders a card element containing:

- Heist title as a Next.js `<Link>` pointing to `/heists/${id}`
- Deadline formatted as a human-readable date string via `toLocaleDateString()`
- A status badge element whose text and colour class derive from the `mode` prop (`active` → "Active" using `--color-success`; `assigned` → "Assigned" using `--color-primary`)
- Assigned crew codename (`assignedToCodename`), falling back to "No crew assigned" if empty

All multi-class elements use a single `styles.X` class reference; no more than one Tailwind utility class appears directly in JSX.

**Props interface:**

```
HeistCardProps {
  id: string
  title: string
  deadline: Date
  assignedToCodename: string
  mode: 'active' | 'assigned'
}
```

These map directly from the `Heist` type in `types/firestore/heist.ts`.

### 2. `components/HeistCard/HeistCard.module.css`

Opens with `@reference "../../app/globals.css"`.

Defines classes:

- `.card` — card container: `rounded-xl`, padding, `background-color: var(--color-light)`, border using `var(--color-lighter)`
- `.title` — font weight, truncation if title overflows
- `.badge` — inline-block, small rounded pill; two modifier variants `.badgeActive` (color: `var(--color-success)`) and `.badgeAssigned` (color: `var(--color-primary)`), each setting a faint matching background
- `.meta` — flex row for deadline and crew info, small text, `var(--color-body)`
- `.crew` — crew codename text

### 3. `components/HeistCard/index.ts`

Re-exports the default export: `export { default } from "./HeistCard"`.

### 4. `components/HeistCardSkeleton/HeistCardSkeleton.tsx`

No props required. Renders the same outer card shell as `HeistCard` (using `styles.card`) with inner `div` elements representing the shimmer placeholders for title, badge, and meta rows. Structure mirrors the existing `Skeleton` component pattern.

### 5. `components/HeistCardSkeleton/HeistCardSkeleton.module.css`

Opens with `@reference "../../app/globals.css"`.

Defines:

- `@keyframes shimmer` — `0%, 100% { opacity: 1 } 50% { opacity: 0.4 }`
- `.card` — same container styles as `HeistCard`'s `.card` so dimensions match exactly
- `.line`, `.lineShort`, `.lineMed` — height `0.75rem`, `border-radius: 9999px`, `background-color: var(--color-lighter)`, `animation: shimmer 1.6s ease-in-out infinite`; width variants: `.lineShort` 45%, `.lineMed` 65%

### 6. `components/HeistCardSkeleton/index.ts`

Re-exports the default export.

### 7. `app/(dashboard)/heists/heists.module.css`

New CSS module for the page. Opens with `@reference "../../globals.css"`.

Defines:

- `.grid` — `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem`

### 8. `tests/components/HeistCard.test.tsx`

See Testing Approach section.

---

## Already Existing — No Action Needed

- `app/(dashboard)/heists/[id]/page.tsx` — already a working shell. The acceptance criterion is already met.

---

## Files to Modify

### `app/(dashboard)/heists/page.tsx`

1. Remove the `useHeists("expired")` call and the expired section entirely.
2. Keep `useHeists("active")` and `useHeists("assigned")`.
3. Import `HeistCard`, `HeistCardSkeleton`, and `styles` from the new module.
4. Derive a combined loading state: `const loading = activeLoading || assignedLoading`.
5. When loading, render the grid containing exactly **3** `<HeistCardSkeleton />` instances.
6. When not loading, render the grid with one `<HeistCard />` per heist — active heists tagged `mode="active"`, assigned heists tagged `mode="assigned"`.
7. Remove the internal `HeistList` helper function.
8. The existing `<div className="page-content">` wrapper stays as-is; the grid `<div>` inside uses `className={styles.grid}`.

---

## Filtering Logic

The `useHeists` hook already performs all Firestore filtering:

- `"active"` — heists where `assignedTo` includes the current user's UID and `deadline > now`
- `"assigned"` — heists where `createdBy == currentUser.uid` and `deadline > now`

No client-side status filtering is needed. The merged array `[...activeHeists, ...assignedHeists]` is the complete set to display. The `mode` prop determines badge label and colour.

---

## Grid Layout

Defined entirely in `heists.module.css` using the `.grid` class on a `<div>` wrapper inside the page. No responsive breakpoints required by the spec.

---

## Skeleton Implementation

`HeistCardSkeleton` uses CSS-only shimmer by animating `opacity` on placeholder `<div>` elements via the `shimmer` keyframe (same technique as the existing `Skeleton` component). The skeleton's `.card` class must match `HeistCard`'s `.card` exactly for `border-radius`, `padding`, and `background-color` so that skeletons occupy identical grid dimensions.

---

## TypeScript Props

`HeistCardProps` is self-contained in `HeistCard.tsx`. Fields from the `Heist` type in `types/firestore/heist.ts`:

| Prop | Type | Source |
|------|------|--------|
| `id` | `string` | Firestore document ID |
| `title` | `string` | `heist.title` |
| `deadline` | `Date` | `heist.deadline` (already a `Date` after converter) |
| `assignedToCodename` | `string` | display name, with fallback |
| `mode` | `'active' \| 'assigned'` | injected by the page when mapping arrays |

---

## Testing Approach

File: `tests/components/HeistCard.test.tsx`

**Mocks required:**
- `vi.mock("next/link", ...)` — render a plain `<a>` to allow link assertions via `getByRole("link")`
- No Firebase mocks needed — `HeistCard` is a pure presentational component

**Test fixture:**
```
{
  id: "heist-1",
  title: "Steal the Stapler",
  deadline: new Date("2099-12-31"),
  assignedToCodename: "ArcticFox",
  mode: "active"
}
```

**4 test cases:**

1. **Renders core fields** — assert title text, formatted deadline, and status badge text are in the document.
2. **Title is a link to the correct path** — `getByRole("link", { name: fixture.title })` has `href === "/heists/heist-1"`.
3. **Expired heists are filtered at the page level** — render a small inline list component that mimics the page's filter; assert a heist with past deadline is excluded when omitted from the input array.
4. **HeistCardSkeleton renders without crashing** — render `<HeistCardSkeleton />` and assert the container is in the document.

---

## Verification Steps

```bash
npm test -- tests/components/HeistCard.test.tsx --run
npm run build
npm run dev
```

Manual checks on `http://localhost:3000`:

1. Navigate to `/heists` while logged in — confirm 3 skeleton cards appear briefly, then real cards render in a 3-column grid.
2. Confirm expired heists do not appear.
3. Confirm "Active" badge on current-user-assigned heists; "Assigned" badge on heists the user created.
4. Click a heist title — confirm navigation to `/heists/:id` renders without errors.

---

## Critical Files

- `app/(dashboard)/heists/page.tsx`
- `types/firestore/heist.ts`
- `components/Skeleton/Skeleton.module.css` (reference for shimmer pattern)
- `app/globals.css` (design tokens)
- `tests/components/Navbar.test.tsx` (reference for test patterns)
