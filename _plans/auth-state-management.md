# Plan: Auth State Management with useUser Hook

## Context

The app has Firebase auth initialized (`lib/firebase.ts` exports `auth`) but no global auth state. Routes and components have no way to know if a user is logged in without prop-drilling or registering duplicate `onAuthStateChanged` listeners. This plan adds a single context-based listener and a `useUser()` hook that any component can call.

## Approach

Create a `"use client"` context module (`lib/AuthContext.tsx`) that registers one `onAuthStateChanged` listener in a React effect, exposes the result via context, and provides a `useUser()` hook. Mount the provider at the root layout so all routes — public and dashboard — share it. Update the splash page to read from the hook and stub the redirect logic.

---

## Files to Create

### `lib/AuthContext.tsx` (new)

```tsx
"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

type AuthState = { user: User | null; loading: boolean }
const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false })
    })
    return unsubscribe
  }, [])
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useUser(): AuthState {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error("useUser must be used within an AuthProvider")
  return ctx
}
```

Key decisions:
- `"use client"` on the module — Firebase Auth is client-only; keeps the root layout a server component.
- Initial state `{ user: null, loading: true }` — prevents flash of unauthenticated UI.
- Effect returns `unsubscribe` directly — cleans up listener on unmount.
- Throws outside provider — catches misconfigured trees early.

### `tests/lib/AuthContext.test.tsx` (new)

Mock `firebase/auth` and `@/lib/firebase`, then test:
1. Initial render → `{ user: null, loading: true }`
2. `onAuthStateChanged` callback fires with a user → `{ user, loading: false }`
3. `onAuthStateChanged` callback fires with null → `{ user: null, loading: false }`
4. `useUser()` outside `AuthProvider` → throws `"useUser must be used within an AuthProvider"`

Mock setup pattern:
```ts
vi.mock("firebase/auth", () => ({ onAuthStateChanged: vi.fn() }))
vi.mock("@/lib/firebase", () => ({ auth: {} }))
```

---

## Files to Modify

### `app/layout.tsx`

Import `AuthProvider` from `@/lib/AuthContext` and wrap `{children}`:
```tsx
import { AuthProvider } from "@/lib/AuthContext"
// ...
<body>
  <AuthProvider>{children}</AuthProvider>
</body>
```
The layout stays a server component — importing a `"use client"` component is valid.

### `app/(public)/page.tsx`

Add `"use client"`, call `useUser()`, and stub redirect logic:
```tsx
"use client"
import { useUser } from "@/lib/AuthContext"
// ...
const { user, loading } = useUser()
// TODO: redirect to /heists when user !== null
// TODO: redirect to /login when user === null && !loading
```
No actual navigation is implemented per spec.

---

## Verification

1. `npm run lint` — no TypeScript or lint errors.
2. `npm test -- tests/lib/AuthContext.test.tsx --run` — all new tests pass.
3. `npm run build` — no SSR errors.
4. `npm run dev` — open `/`, confirm no console errors and loading state doesn't flash permanently.
