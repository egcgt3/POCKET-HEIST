# Plan: Create Heist Form

## Context

The `/heists/create` page is a placeholder stub. This feature builds out the full "Create Heist" form: a client component that fetches registered users from Firestore, lets the creator assign the heist to another user, validates all fields, writes a typed `CreateHeistInput` document to Firestore, and redirects to `/heists` on success.

---

## New Files

### 1. `components/CreateHeistForm/CreateHeistForm.tsx`

A `"use client"` component following the same structure as `AuthForm`:

**State:**
- `title`, `description` — text field values
- `assignedToUid`, `assignedToCodename` — set together when the user picks from the dropdown
- `titleError`, `descriptionError`, `assignedToError` — inline field errors
- `submitting` — disables the submit button while the Firestore write is in flight
- `firestoreError` — inline error shown if `addDoc` rejects
- `users` — list of `{ id, codename }` fetched from the `users` collection, filtered to exclude the current user, sorted alphabetically by codename
- `usersLoading` — true while the users list is being fetched

**On mount (`useEffect`):**
- Call `getDocs(collection(db, COLLECTIONS.USERS))` to fetch all users.
- Filter out the currently authenticated user (by uid).
- Sort remaining users alphabetically by `codename`.
- Store in `users` state.

**`handleSubmit`:**
1. Run client-side validation: all three fields must be non-empty.
2. Build a `CreateHeistInput` object:
   - `createdBy`: `user.uid`
   - `createdByCodename`: `user.displayName ?? user.uid`
   - `assignedTo`, `assignedToCodename`: from dropdown selection state
   - `deadline`: `new Date(Date.now() + 48 * 60 * 60 * 1000)`
   - `createdAt`: `serverTimestamp()`
   - `finalStatus`: `null`
3. Call `addDoc(collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter), data)`.
4. On success: `router.push("/heists")`.
5. On failure: set `firestoreError` with a friendly message.

**Imports to use:**
- `CreateHeistInput`, `heistConverter`, `COLLECTIONS` from `@/types/firestore`
- `addDoc`, `collection`, `getDocs`, `serverTimestamp` from `firebase/firestore`
- `db` from `@/lib/firebase`
- `useUser` from `@/lib/AuthContext`
- `useRouter` from `next/navigation`

### 2. `components/CreateHeistForm/CreateHeistForm.module.css`

Mirror the CSS class structure from `AuthForm.module.css`: `.form`, `.fieldGroup`, `.label`, `.input`, `.submitBtn`, `.errorMsg`. Add a `.select` class styled identically to `.input` for the assignee dropdown. No new design tokens needed.

### 3. `components/CreateHeistForm/index.ts`

Barrel export: `export { default } from "./CreateHeistForm"`.

---

## Modified Files

### 4. `app/(dashboard)/heists/create/page.tsx`

Replace the stub with `<CreateHeistForm />` inside the existing layout wrappers. Import from `@/components/CreateHeistForm`.

---

## New Test File

### `tests/components/CreateHeistForm.test.tsx`

Mock setup (same pattern as `AuthForm.test.tsx`):
- `vi.mock("firebase/firestore")` — mock `addDoc`, `collection`, `getDocs`, `serverTimestamp`
- `vi.mock("@/lib/firebase")` — `{ db: {} }`
- `vi.mock("@/lib/AuthContext")` — `useUser` returns configurable state
- `vi.mock("next/navigation")` — `useRouter` returns `{ push: vi.fn() }`

Tests:
- Renders title, description, and assignee select fields.
- Populates the assignee dropdown with users from `getDocs`, excluding the current user, sorted alphabetically.
- Shows "No users available" (or disables submit) when the users list is empty after filtering.
- Shows validation errors for each empty field on submit without calling `addDoc`.
- Calls `addDoc` with a correctly shaped `CreateHeistInput` on valid submission.
- `deadline` in the submitted data is approximately 48 hours from now (within a few seconds).
- `createdAt` is the result of `serverTimestamp()`.
- Disables the submit button while the write is in flight.
- Calls `router.push("/heists")` after a successful write.
- Shows an inline error message if `addDoc` rejects.

---

## Verification

```bash
npm test -- tests/components/CreateHeistForm.test.tsx --run
npm run build
npm run dev
# Log in, navigate to /heists/create
# Fill in title, description, pick an assignee, submit
# Confirm redirect to /heists and document appears in Firestore
```
