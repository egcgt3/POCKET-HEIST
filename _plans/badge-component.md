# Plan: Badge Component

## Context

`HeistCard` and `ExpiredHeistCard` each define their own inline `.badge` span with colour rules driven by data attributes (`data-mode` and `data-status` respectively). This is duplicated logic — same shape, same visual pattern, different values. The spec calls for a shared `Badge` component that owns the colour-per-variant logic and can be dropped into either card. The user confirmed the open question: the component should also accept an optional `aria-label` prop.

---

## Implementation Steps

### 1. Create `components/Badge/`

Three files, following the standard barrel pattern:

**`Badge.tsx`**
- Props: `variant: "active" | "assigned" | "success" | "failure"` and optional `ariaLabel?: string`
- A `VARIANT_LABELS` lookup maps each variant to its display string:
  - `active` → "Active"
  - `assigned` → "Assigned"
  - `success` → "Mission Complete"
  - `failure` → "Mission Failed"
- If `variant` is not in the map, return `null`
- Renders `<span className={styles.badge} data-variant={variant} aria-label={ariaLabel}>{label}</span>`

**`Badge.module.css`**
- `@reference "../../app/globals.css"` at the top
- `.badge` base: copy the shared pill styles (`text-xs font-semibold rounded-full self-start`, `padding: 0.125rem 0.5rem`)
- Colour rules via `data-variant` attribute:
  - `[data-variant="active"]` and `[data-variant="success"]` → `color: var(--color-success)` / `background-color: rgba(5, 223, 114, 0.1)`
  - `[data-variant="assigned"]` → `color: var(--color-primary)` / `background-color: rgba(194, 122, 255, 0.1)`
  - `[data-variant="failure"]` → `color: var(--color-error)` / `background-color: rgba(255, 100, 103, 0.1)`

**`index.ts`**
- `export { default } from "./Badge"`

### 2. Refactor `HeistCard`

- Import `Badge` from `@/components/Badge`
- Replace `<span className={styles.badge} data-mode={mode}>{mode === "active" ? "Active" : "Assigned"}</span>` with `<Badge variant={mode} />`
- Remove the `.badge`, `.badge[data-mode="active"]`, and `.badge[data-mode="assigned"]` rules from `HeistCard.module.css`

### 3. Refactor `ExpiredHeistCard`

- Import `Badge` from `@/components/Badge`
- Replace `<span className={styles.badge} data-status={finalStatus}>{finalStatus === "success" ? "Mission Complete" : "Mission Failed"}</span>` with `<Badge variant={finalStatus} />`
- Remove the `.badge`, `.badge[data-status="success"]`, and `.badge[data-status="failure"]` rules from `ExpiredHeistCard.module.css`

### 4. Write `tests/components/Badge.test.tsx`

Mirror the pattern from `HeistCard.test.tsx` and `ExpiredHeistCard.test.tsx`:
- No CSS class assertions — project philosophy favours content/attribute checks
- One `describe("Badge")` block with:
  - Renders "Active" for `variant="active"`
  - Renders "Assigned" for `variant="assigned"`
  - Renders "Mission Complete" for `variant="success"`
  - Renders "Mission Failed" for `variant="failure"`
  - Applies `data-variant` attribute matching the variant passed
  - Returns nothing (no DOM element) for an unknown variant
  - Renders with a custom `aria-label` when provided

### 5. Add Badge to the preview page

In `app/(public)/preview/page.tsx`:
- Import `Badge from "@/components/Badge"`
- Add a new `<section>` showing all four variants side by side

---

## Files Modified

| File | Action |
|------|--------|
| `components/Badge/Badge.tsx` | Create |
| `components/Badge/Badge.module.css` | Create |
| `components/Badge/index.ts` | Create |
| `components/HeistCard/HeistCard.tsx` | Use `<Badge>` instead of inline span |
| `components/HeistCard/HeistCard.module.css` | Remove `.badge` rules |
| `components/ExpiredHeistCard/ExpiredHeistCard.tsx` | Use `<Badge>` instead of inline span |
| `components/ExpiredHeistCard/ExpiredHeistCard.module.css` | Remove `.badge` rules |
| `tests/components/Badge.test.tsx` | Create |
| `app/(public)/preview/page.tsx` | Add Badge section |

---

## Verification

1. `npm test -- tests/components/Badge.test.tsx --run` — all Badge tests pass
2. `npm test -- tests/components/HeistCard.test.tsx tests/components/ExpiredHeistCard.test.tsx --run` — existing card tests still pass
3. `npm run dev` → visit `/preview` and confirm all four Badge variants render with correct colours
4. `npm run lint` — no lint errors
