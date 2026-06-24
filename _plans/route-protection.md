# Plan: Route Protection

## Context

Both route group layouts currently render their children unconditionally. `AuthContext` already tracks `{ user, loading }` via `onAuthStateChanged`, but no layout uses it. This feature gates each group: public pages redirect logged-in users to `/heists`; dashboard pages redirect guests to `/login`. A loader is shown while Firebase resolves auth state so neither group's content flashes before the redirect fires.

---

## Approach

Both layouts become client components that call `useUser()`. The render logic follows the same pattern in each:

- While `loading` is true → render the loader (auth state not yet known)
- When `loading` is false and a redirect is needed → call `router.replace(destination)` via `useEffect` and keep rendering the loader (prevents content flash while router navigates)
- Otherwise → render children normally

`useEffect` is used for the redirect so it runs after hydration, consistent with how Next.js App Router client components handle navigation.

---

## Modified Files

### 1. `app/(public)/layout.tsx`

- Add `"use client"` directive.
- Import `useUser` from `@/lib/AuthContext` and `useRouter` from `next/navigation`.
- Import `Loader2` from `lucide-react` for the spinner icon.
- Add a `useEffect` that calls `router.replace("/heists")` when `!loading && user`.
- Return the loader while `loading || !!user`.
- Otherwise return the existing `<main className="public">{children}</main>`.

### 2. `app/(dashboard)/layout.tsx`

- Add `"use client"` directive.
- Import `useUser` from `@/lib/AuthContext` and `useRouter` from `next/navigation`.
- Import `Loader2` from `lucide-react` for the spinner icon.
- Add a `useEffect` that calls `router.replace("/login")` when `!loading && !user`.
- Return the loader while `loading || !user`.
- Otherwise return the existing `<><Navbar /><main>{children}</main></>`.

### 3. `app/globals.css`

Add a `.auth-loader` utility class:
- Full viewport height and width, flex-centered.
- The `Loader2` icon inside gets a CSS spin animation (`@keyframes spin` or Tailwind's `animate-spin`).

No new CSS module files needed — the loader is simple enough to style globally.

---

## New Test Files

### `tests/app/(public)/layout.test.tsx`

Mock `useUser` from `@/lib/AuthContext`, `useRouter` from `next/navigation`, and `lucide-react`.

Tests:
- Renders the loader when `loading: true`.
- Calls `router.replace("/heists")` and renders the loader when `user` is non-null and `loading: false`.
- Renders children when `user` is null and `loading: false`.

### `tests/app/(dashboard)/layout.test.tsx`

Same mocking pattern. Also mock `@/components/Navbar` to avoid pulling in its own `useUser` dependency.

Tests:
- Renders the loader when `loading: true`.
- Calls `router.replace("/login")` and renders the loader when `user` is null and `loading: false`.
- Renders children (and Navbar) when `user` is non-null and `loading: false`.

---

## Verification

```bash
npm test -- tests/app --run
npm run build
npm run dev
# 1. Visit /login while logged in → loader flashes → redirect to /heists
# 2. Visit /heists while logged out → loader flashes → redirect to /login
# 3. Visit /heists while logged in → renders dashboard normally
# 4. Visit /login while logged out → renders login form normally
```
