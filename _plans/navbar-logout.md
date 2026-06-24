# Plan: Navbar Logout Button

## Context

The `Navbar` component is currently a server component with no auth awareness. Now that `AuthContext` provides reactive auth state via `useUser()`, we can make the Navbar auth-aware: show a "Log Out" button only when a user is logged in, and call Firebase `signOut` when clicked.

---

## Modified Files

### 1. `components/Navbar/Navbar.tsx`

- Add `"use client"` directive at the top (required to call `useUser()` hook).
- Import `useUser` from `@/lib/AuthContext`.
- Import `signOut` from `firebase/auth`.
- Import `auth` from `@/lib/firebase`.
- Destructure `{ user, loading }` from `useUser()` inside the component.
- Add `async function handleLogout()` that calls `signOut(auth)` wrapped in try/catch (silent failure on error is acceptable).
- Render a "Log Out" `<button>` inside the `<ul>` only when `user && !loading`. Apply a new `.logoutBtn` CSS class.

### 2. `components/Navbar/Navbar.module.css`

Add `.logoutBtn` styled to match the navbar aesthetic but visually distinct via color. Reuse the same sizing/padding/font-weight/border-radius pattern as `.createBtn` but use a flat muted color (e.g. `var(--color-secondary)` at reduced opacity, or a neutral border-only style) instead of the primary gradient. Exact token choice determined during implementation by checking `app/globals.css`.

### 3. `tests/components/Navbar.test.tsx`

Add module-level mocks:
```
vi.mock("@/lib/AuthContext", ...)  // useUser returns configurable state
vi.mock("firebase/auth", ...)      // signOut: vi.fn()
vi.mock("@/lib/firebase", ...)     // auth: {}
```

Add a new `describe("logout button")` block with tests:
- Renders "Log Out" button when `useUser` returns a non-null user.
- Does not render "Log Out" button when `user` is null.
- Does not render "Log Out" button while `loading` is true.
- Clicking "Log Out" calls `signOut` with the `auth` instance.
- Does not throw when `signOut` rejects.

Keep existing heading/link tests intact — they should still pass since those elements are always rendered regardless of auth state.

---

## Verification

```bash
npm test -- tests/components/Navbar.test.tsx --run
npm run build
npm run dev  # log in, confirm button appears; click it, confirm user is signed out
```
