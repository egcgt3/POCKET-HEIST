# Spec for Route Protection

branch: claude/feature/route-protection
figma_component (if used): N/A

## Summary

Add auth-based route protection to both Next.js App Router route groups. The `(public)` group (login, signup, landing) must redirect authenticated users away; the `(dashboard)` group must redirect unauthenticated users away. During the initial Firebase auth state resolution (while `loading` is true), each group layout renders a minimal full-screen loader so the user never sees a flash of the wrong content before the redirect fires.

## Functional Requirements

- The `(public)` group layout must read auth state via `useUser` from `lib/AuthContext`.
  - While `loading` is true, render a simple full-screen loader.
  - Once `loading` is false and `user` is non-null, redirect to `/heists`.
  - Once `loading` is false and `user` is null, render the page normally.
- The `(dashboard)` group layout must read auth state via `useUser` from `lib/AuthContext`.
  - While `loading` is true, render a simple full-screen loader.
  - Once `loading` is false and `user` is null, redirect to `/login`.
  - Once `loading` is false and `user` is non-null, render the page normally.
- Redirects must use Next.js `useRouter().replace()` so the protected page is not added to the browser history.
- Both layouts must become client components (add `"use client"`) to use the `useUser` hook.
- The loader must be visually simple — a centered spinner or animated element is sufficient. It does not need to match a specific design; just avoid a blank white screen.
- The loader must not be a separate routed page; it is rendered inline within the layout during the loading state.
- No changes to `app/layout.tsx` (root layout) are required.

## Possible Edge Cases

- Firebase takes longer than expected to resolve auth state — the loader covers this window and prevents a redirect race.
- A user navigates directly to a dashboard URL while unauthenticated — they see the loader briefly then are redirected to `/login`.
- A logged-in user navigates to `/login` or `/signup` — they see the loader briefly then are redirected to `/heists`.
- The `(public)/page.tsx` splash page currently has a TODO for auth-gating — this feature fulfils that requirement via the layout, so the page itself needs no changes.
- `useUser` must be available at the layout level; `AuthProvider` must already wrap both groups (it lives in `app/layout.tsx`).

## Acceptance Criteria

- Visiting `/login` or `/signup` while authenticated redirects to `/heists` without flashing the public page.
- Visiting `/heists` or any dashboard page while unauthenticated redirects to `/login` without flashing the dashboard page.
- A brief loader is shown in both cases while Firebase resolves auth state.
- Authenticated users can access all dashboard routes; unauthenticated users cannot.
- Unauthenticated users can access all public routes; authenticated users cannot.
- No changes are introduced to individual page components.

## Open Questions

- Should the loader be a spinning icon (e.g. from `lucide-react`) or a CSS-only animation? Preference: use an existing icon from `lucide-react` if a suitable one exists, otherwise a simple CSS pulse.
- Should the `(public)` landing/splash page (`/`) also be gated, or only login and signup? The spec assumes the entire `(public)` group is gated, including the splash page.

## Testing Guidelines

Create test files in `tests/` covering both layouts:

- `(public)` layout: renders the loader while `loading` is true.
- `(public)` layout: redirects to `/heists` when `user` is non-null and `loading` is false.
- `(public)` layout: renders children when `user` is null and `loading` is false.
- `(dashboard)` layout: renders the loader while `loading` is true.
- `(dashboard)` layout: redirects to `/login` when `user` is null and `loading` is false.
- `(dashboard)` layout: renders children when `user` is non-null and `loading` is false.
