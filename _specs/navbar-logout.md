# Spec for navbar-logout

branch: claude/feature/navbar-logout
figma_component (if used): N/A

## Summary

Add a logout button to the `Navbar` component that signs the current user out of Firebase Auth when clicked. The button must only be visible when a user is authenticated. No redirect behaviour is required after sign-out — the auth state change propagated through `AuthContext` is sufficient.

## Functional Requirements

- The `Navbar` component must read the current auth state via the existing `useUser` hook from `lib/AuthContext.tsx`.
- A logout button must be rendered inside the navbar when `user` is non-null (i.e. a user is logged in).
- The logout button must not be rendered when `user` is null or while `loading` is true.
- Clicking the button must call `signOut` from the Firebase Auth Web SDK using the `auth` export from `lib/firebase.ts`.
- No redirect should occur after sign-out; the UI update is handled reactively by `AuthContext`.
- Only the Firebase Web SDK (`firebase/auth`) may be used — no Admin SDK or third-party wrappers.

## Possible Edge Cases

- `signOut` fails due to a network error — the error should be caught and not crash the UI; a silent failure is acceptable for this iteration.
- The `loading` state is true on initial render — the button must not flash briefly before the auth state resolves.
- The user is on a protected route when they sign out — out of scope for this feature; no redirect handling is required yet.

## Acceptance Criteria

- The logout button is visible in the navbar when a user is logged in.
- The logout button is not visible when no user is logged in or while auth state is loading.
- Clicking the logout button calls Firebase `signOut` and clears the authenticated user from `AuthContext`.
- The component does not crash if `signOut` rejects.

## Open Questions

- Should the button label be "Log Out" or "Sign Out"? Default to "Log Out" to match the existing login form label ("Log In"). Log out
- Should the button have a distinct visual style (e.g. outlined or destructive) compared to the existing navbar links, or match the current navbar aesthetic? match aesthetic just a different color.

## Testing Guidelines

Create a test file (or extend the existing `tests/components/Navbar.test.tsx`) covering:

- Logout button is rendered when `useUser` returns a non-null user.
- Logout button is not rendered when `useUser` returns `{ user: null, loading: false }`.
- Logout button is not rendered while `loading` is true.
- Clicking the logout button calls `signOut` with the `auth` instance.
- If `signOut` rejects, no unhandled error is thrown.
