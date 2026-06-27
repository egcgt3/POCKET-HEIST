# Spec for useHeists Hook

branch: claude/feature/use-heists-hook
figma_component (if used): N/A

## Summary

Create a `useHeists` hook at `hooks/useHeists.ts` that subscribes to real-time Firestore data from the `heists` collection and returns a typed array of `Heist` objects. The hook accepts a single `mode` argument (`'active'`, `'assigned'`, or `'expired'`) which determines the Firestore query applied. Once built, use the hook in `app/(dashboard)/heists/page.tsx` to render the titles of each heist in all three result sets.

## Functional Requirements

- The hook must be named `useHeists` and accept a single argument: `mode`, typed as `'active' | 'assigned' | 'expired'`.
- The hook must use Firestore's real-time listener (`onSnapshot`) so the UI updates automatically when data changes.
- The hook must return an array of `Heist` objects (from `types/firestore`) and a `loading` boolean.
- Query behaviour by mode:
  - `'active'` — heists where `assignedTo` equals the current user's uid AND `deadline` is greater than the current date/time.
  - `'assigned'` — heists where `createdBy` equals the current user's uid AND `deadline` is greater than the current date/time.
  - `'expired'` — heists where `deadline` is less than or equal to the current date/time AND `finalStatus` is not null. Not filtered by user.
- The current user must be sourced from `useUser()` from `AuthContext`.
- The `heistConverter` from `types/firestore` must be used on the collection reference so documents are returned as typed `Heist` objects.
- The hook must unsubscribe from the Firestore listener on unmount (cleanup function in `useEffect`).
- When the user is not yet resolved (loading), the hook should not make any query and should return an empty array.
- `app/(dashboard)/heists/page.tsx` must be updated to use `useHeists` three times (once per mode) and render the heist titles in each of the three existing section divs (`active-heists`, `assigned-heists`, `expired-heists`).

## Possible Edge Cases

- The current user is `null` or still loading — the hook must not fire a query and should return `[]` with `loading: true`.
- A result set is empty — the section should render a meaningful empty state message (e.g. "No active heists").
- The Firestore listener fails — errors should be caught and the hook should return an empty array without crashing the page.
- The `mode` argument changes at runtime — the listener must be torn down and re-established with the new query.
- Expired heists with `finalStatus: null` must not appear in the `'expired'` result set.

## Acceptance Criteria

- Calling `useHeists('active')` returns only heists assigned to the current user with a future deadline.
- Calling `useHeists('assigned')` returns only heists created by the current user with a future deadline.
- Calling `useHeists('expired')` returns heists with a past deadline and a non-null `finalStatus`, regardless of who created or was assigned them.
- All three modes use real-time subscriptions that update the UI without a page refresh.
- The hook cleans up its Firestore listener when the component unmounts.
- The heists page renders the title of each heist under the correct section heading.
- Empty result sets show a meaningful placeholder message rather than blank sections.

## Open Questions

- Should the `'expired'` query filter by the current user at all, or truly show all expired heists across all users? by the current user

## Testing Guidelines

Create a test file `tests/hooks/useHeists.test.tsx`:

- Returns an empty array and `loading: true` while the user is not resolved.
- Subscribes with the correct Firestore query for each mode (`active`, `assigned`, `expired`).
- Returns typed `Heist` objects by applying `heistConverter`.
- Unsubscribes from the listener on unmount.
- Returns an empty array (not a crash) if the listener emits an error.
- Updates the returned array when Firestore emits a new snapshot.
