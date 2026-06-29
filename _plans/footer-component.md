# Plan: Footer Component

## Context
The spec calls for a persistent `Footer` component displaying "© Copyright Heists <year>" where the year is computed at runtime. Per the spec's resolved open question, the footer should appear on **both** authenticated (dashboard) and unauthenticated (public) pages.

---

## Files to Create

### `components/Footer/Footer.tsx`
- Server Component (no `"use client"` — year computed server-side via `new Date().getFullYear()`)
- Renders: `<footer className={styles.footer}>© Copyright Heists {new Date().getFullYear()}</footer>`
- Imports `styles` from `./Footer.module.css`

### `components/Footer/Footer.module.css`
- Opens with `@reference "../../app/globals.css"`
- `.footer` class: centered text, muted body color (`var(--color-body)`), small font size, vertical padding — using `@apply` for spacing utilities

### `components/Footer/index.ts`
- `export { default } from "./Footer"`

---

## Files to Modify

### `app/(dashboard)/layout.tsx`
- Import `Footer` from `@/components/Footer`
- Add `<Footer />` after the closing `</main>` tag, inside the authenticated return fragment

### `app/(public)/layout.tsx`
- Import `Footer` from `@/components/Footer`
- Add `<Footer />` after the closing `</main>` tag in the unauthenticated return

### `app/(public)/preview/page.tsx`
- Import and render `<Footer />` in a labeled section

---

## Files to Create (Tests)

### `tests/components/Footer.test.tsx`
- Render `<Footer />` and assert the copyright text is present
- Assert the rendered year matches `new Date().getFullYear()` (no hardcoded year)
- No mocks needed — Footer is a pure render with no external dependencies

---

## Verification
1. `npm run dev` — visit `/heists` (dashboard) and a public page (e.g. `/login`) and confirm footer appears on both
2. `npm run test -- tests/components/Footer.test.tsx --run` — all tests pass
3. `npm run lint` — no lint errors
