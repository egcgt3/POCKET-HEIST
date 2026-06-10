# Spec for Auth State Management with useUser Hook

branch: claude/feature/auth-state-management

## Summary

Add a global, realtime Firebase auth state listener that exposes the current user via a `useUser` hook. The hook returns `null` when logged out and the Firebase `User` object when logged in. Any component or page in the app can call `useUser()` to read auth state without prop drilling or redundant listeners.

## Functional Requirements

- A single Firebase `onAuthStateChanged` listener is registered once for the lifetime of the app and is never duplicated.
- The listener's state is held in a React context so it is accessible from anywhere in the component tree.
- A `useUser()` hook provides access to that context. It returns:
  - `null` when no user is authenticated.
  - The Firebase `User` object when a user is signed in.
  - A third value (`loading: boolean`) indicating whether the initial auth check is still in progress, so consumers can avoid a flash of unauthenticated UI.
- The context provider is mounted at the app's root layout so every route — both `(public)` and `(dashboard)` — can access it.
- The splash page (`app/(public)/page.tsx`) currently has a placeholder comment for auth-gating. Once `useUser` exists, update it to read from the hook (redirect logic can be stubbed; do not implement navigation yet).
- No sign-up, login, or logout flows are implemented in this spec.

## Possible Edge Cases

- Auth state listener fires before React renders — `loading` state prevents incorrect null assumptions.
- Multiple calls to `useUser` across the tree must all share the same underlying listener (single source of truth via context).
- Server-side rendering: Firebase Auth is client-only; the provider must not be executed on the server. Use a client component boundary.
- `useUser` called outside the provider should throw a clear error to catch misconfigured trees early.

## Acceptance Criteria

- `useUser()` returns `{ user: null, loading: true }` on first render before Firebase resolves.
- After resolution, `loading` becomes `false` and `user` is either `null` or the authenticated `User`.
- Calling `useUser()` in a component outside the provider throws a descriptive error.
- Only one `onAuthStateChanged` subscription exists at any time (verified by checking the listener is not duplicated on hot reload).
- The splash page (`app/(public)/page.tsx`) reads `useUser` and logs or stubs a conditional based on auth state.
- No regressions in the existing login/signup pages (`AuthForm`).

## Open Questions

- Should `loading` be exposed as a separate named field or as a discriminated union (`{ status: 'loading' | 'authenticated' | 'unauthenticated', user: User | null }`)? no
- Should the provider live in the root `app/layout.tsx` or in a dedicated wrapper component imported by the layout? in a dedicated wrapper component

## Testing Guidelines

Create a test file in `tests/` for the new feature. Focus on:

- `useUser` returns the initial loading state before the listener fires.
- `useUser` updates correctly when the mock auth state changes to an authenticated user.
- `useUser` updates correctly when the mock auth state changes to `null` (logged out).
- Calling `useUser` outside the provider throws the expected error.
