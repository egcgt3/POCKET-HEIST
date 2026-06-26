# Plan: useHeists Hook + Heists Page Integration

## Context

The `/heists` dashboard page is a static skeleton with three empty sections. This feature adds a `useHeists` hook that subscribes to real-time Firestore data and powers all three sections: active heists (assigned to me, deadline not passed), assigned heists (created by me, deadline not passed), and expired heists (assigned to me, deadline passed, finalStatus not null).

---

## New Files

### 1. `hooks/useHeists.ts`

**Signature:** `useHeists(mode: 'active' | 'assigned' | 'expired'): { heists: Heist[]; loading: boolean }`

**Imports to use:**
- `collection`, `onSnapshot`, `query`, `where` from `firebase/firestore`
- `db` from `@/lib/firebase`
- `useUser` from `@/lib/AuthContext`
- `COLLECTIONS`, `Heist`, `heistConverter` from `@/types/firestore`

**Behaviour:**
- If `userLoading` is true or `user` is null: return `{ heists: [], loading: true }` immediately, skip query.
- On each effect run, capture `new Date()` as `now` for deadline comparisons.
- Build a Firestore query using `collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)`:
  - `'active'`: `where('assignedTo', '==', uid)` + `where('deadline', '>', now)`
  - `'assigned'`: `where('createdBy', '==', uid)` + `where('deadline', '>', now)`
  - `'expired'`: `where('assignedTo', '==', uid)` + `where('deadline', '<=', now)`
- For `'expired'` only: filter the snapshot docs client-side to exclude any where `finalStatus === null`.
- Subscribe with `onSnapshot(q, (snapshot) => { ... }, (error) => { ... })`:
  - On snapshot: map docs via converter, apply expired filter if needed, `setHeists(docs)`, `setLoading(false)`.
  - On error: `setHeists([])`, `setLoading(false)` — no crash.
- Return the `onSnapshot` unsubscribe function from `useEffect` cleanup.
- Effect dependencies: `[user?.uid, userLoading, mode]`

### 2. `tests/hooks/useHeists.test.tsx`

Mock setup (same pattern as `tests/lib/AuthContext.test.tsx` — use `renderHook` + `act`):
- `vi.mock("firebase/firestore")` — mock `collection`, `onSnapshot`, `query`, `where`
- `vi.mock("@/lib/firebase")` — `{ db: {} }`
- `vi.mock("@/lib/AuthContext")` — `useUser` configurable via `vi.mocked(useUser).mockReturnValue(...)`

In `beforeEach`, capture the `onSnapshot` callback so tests can call it with `act()` to simulate real-time updates.

Tests:
- Returns `{ heists: [], loading: true }` while user is loading.
- Returns `{ heists: [], loading: true }` when user is null.
- Calls `onSnapshot` with the correct `where` clauses for each mode.
- Maps snapshot docs and returns typed `Heist[]`.
- Calls the `onSnapshot` unsubscribe function on unmount.
- Returns `{ heists: [], loading: false }` and does not throw on listener error.
- For `'expired'` mode: filters out docs where `finalStatus === null` client-side.

---

## Modified Files

### 3. `app/(dashboard)/heists/page.tsx`

- Add `"use client"` directive.
- Import `useHeists` from `@/hooks/useHeists`.
- Call the hook three times, one per mode, destructuring `{ heists, loading }` from each.
- In each section div render via a small `HeistList` helper:
  - A `<p>Loading…</p>` while `loading` is true.
  - An empty-state `<p>` message when the array is empty and not loading.
  - A `<ul>` of `<li key={h.id}>{h.title}</li>` when heists are present.

---

## Firestore Indexes Required

Compound queries need composite indexes. Firestore will log an error with a direct link to create the index the first time a query runs without one.

Indexes needed (Firebase console or `firestore.indexes.json`):
- Collection `heists`: `assignedTo ASC` + `deadline ASC` (covers `active` and `expired`)
- Collection `heists`: `createdBy ASC` + `deadline ASC` (covers `assigned`)

---

## Verification

```bash
npm test -- tests/hooks/useHeists.test.tsx --run
npm run build
npm run dev
# Log in, navigate to /heists
# Confirm three sections render (loading state → empty state or list of titles)
# Create a heist via /heists/create and verify it appears in the correct section live without refresh
```
