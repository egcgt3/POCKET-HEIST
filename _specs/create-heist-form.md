# Spec for Create Heist Form

branch: claude/feature/create-heist-form
figma_component (if used): N/A

## Summary

Build the "Create Heist" form at `app/(dashboard)/heists/create/page.tsx`. When submitted with valid data, the form creates a new document in the Firestore `heists` collection using the `CreateHeistInput` interface, then redirects the user to `/heists`. Users can assign the heist to any other registered user, whose codename and uid are fetched from the Firestore `users` collection. The `createdAt` and `deadline` values are computed programmatically — `createdAt` via `serverTimestamp()` and `deadline` as 48 hours from the current time.

## Functional Requirements

- The form must include fields for: `title`, `description`, and `assignedTo` (the target user).
- The `assignedTo` field must be a dropdown/select populated from the `users` Firestore collection, displaying each user's `codename`. Selecting a user sets both `assignedTo` (uid) and `assignedToCodename`.
- The `createdBy` and `createdByCodename` fields must be sourced from the currently authenticated user via `useUser()` / Firebase Auth (uid and `displayName`).
- `createdAt` must be set to `serverTimestamp()` from `firebase/firestore`.
- `deadline` must be set to a `Date` 48 hours after the current client time at the moment of submission.
- `finalStatus` must be set to `null` on creation.
- On successful Firestore write, redirect the user to `/heists` using `useRouter().push()`.
- All fields (`title`, `description`, `assignedTo`) must be validated client-side before submission; empty fields must show inline error messages.
- The submit button must be disabled and show a loading state while the Firestore write is in flight.
- On Firestore write failure, display an inline error message without navigating away.
- The `CreateHeistInput` type from `types/firestore` must be used to type the document data passed to `addDoc`.
- The `heistConverter` from `types/firestore` must be used with the collection reference.
- Only the Firebase Web SDK (`firebase/firestore`) may be used — no Admin SDK.

## Possible Edge Cases

- The `users` collection is empty or fails to load — the assignee dropdown should show a loading state or a "No users available" message and prevent submission.
- The current user is the only registered user — they may not be able to assign to anyone else; the dropdown will reflect this.
- The Firestore write fails (network error, permission denied) — an inline error must appear without losing form state.
- The user navigates away mid-form — no partial document should be written to Firestore.
- A user has no `displayName` set in Firebase Auth — fall back to their uid as the codename.

## Acceptance Criteria

- Submitting the form with valid `title`, `description`, and an assigned user creates a Firestore document in the `heists` collection with all `CreateHeistInput` fields populated correctly.
- `createdAt` is a Firestore server timestamp; `deadline` is 48 hours from submission time; `finalStatus` is `null`.
- After a successful write the user is redirected to `/heists`.
- Submitting with empty fields shows validation errors and does not call Firestore.
- The submit button is disabled while the write is pending.
- A Firestore write failure shows an inline error message and keeps the user on the form.

## Open Questions

- Should the current user be allowed to assign a heist to themselves, or only to other users? only to other users
- Should the assignee list be sorted alphabetically by codename, or in insertion order from Firestore? alphabetically by codename

## Testing Guidelines

Create a test file in `tests/` covering the create heist form:

- Renders `title`, `description`, and assignee fields.
- Populates the assignee dropdown from the mocked `users` collection.
- Shows validation errors when submitting with empty fields.
- Calls `addDoc` with the correct `CreateHeistInput` shape on valid submission.
- `createdAt` is `serverTimestamp()` and `deadline` is approximately 48 hours from now.
- Disables the submit button while the write is pending.
- Redirects to `/heists` after a successful write.
- Shows an inline error if `addDoc` rejects.
