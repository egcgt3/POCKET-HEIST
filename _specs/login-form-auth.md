# Spec for Login Form Auth

branch: claude/feature/login-form-auth
figma_component (if used): N/A

## Summary

Wire the existing `AuthForm` component's login (`mode="login"`) path to Firebase Auth so that submitting valid credentials signs the user in. On success, show an inline success message in place of a generic redirect. No navigation should occur after login at this stage.

## Functional Requirements

- When `mode="login"`, submitting the form must call `signInWithEmailAndPassword` from the Firebase Auth Web SDK using the email and password field values.
- The submit button must be disabled and show a loading state while the Firebase call is in flight.
- On a successful sign-in, an inline success message must be displayed within the form (e.g. "You're logged in!"). The form fields may remain visible or be hidden — either is acceptable.
- On failure, an inline error message must be displayed below the submit button using the existing `firebaseError` state and error display pattern already used for signup.
- Known Firebase error codes to handle: `auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-email`, `auth/too-many-requests`.
- The existing client-side validation (email required, password required) must still run before the Firebase call is made.
- No redirect should occur after a successful login. Auth state updates reactively via `AuthContext`.
- Only the Firebase Web SDK (`firebase/auth`) may be used — no Admin SDK or third-party wrappers.

## Possible Edge Cases

- Wrong email or password — must show a user-friendly message, not expose raw Firebase error codes.
- Network failure during sign-in — fallback to a generic "Something went wrong. Please try again." message.
- `auth/too-many-requests` — the user has been temporarily blocked; message should reflect that.
- User submits while a previous request is still in flight — the disabled submit button prevents double-submission.
- User is already signed in when they land on `/login` — out of scope for this feature; no redirect handling required yet.

## Acceptance Criteria

- Submitting the login form with correct credentials signs the user in via Firebase and displays a success message.
- Submitting with incorrect credentials displays a human-readable inline error message.
- The submit button is disabled while the sign-in request is in flight.
- Client-side field validation (email required, password required) still fires before any Firebase call is made.
- No page navigation occurs after a successful sign-in.
- The component does not crash or leave the button permanently disabled if `signInWithEmailAndPassword` rejects.

## Open Questions

- Should the form fields be cleared or hidden after a successful login, or left as-is? form should be cleareed.
- What exact copy should the success message use? Suggestion: "You're logged in!" — confirm before implementing. use suggestion.

## Testing Guidelines

Create or extend a test file in `tests/components/` covering the login path of `AuthForm`:

- Submitting with valid credentials calls `signInWithEmailAndPassword` and shows a success message.
- Submitting with invalid credentials shows an appropriate inline error message.
- The submit button is disabled while the Firebase call is pending.
- Submitting with empty fields shows client-side validation errors and does not call Firebase.
- If `signInWithEmailAndPassword` rejects with `auth/too-many-requests`, the correct message is shown.
- The component does not throw if Firebase rejects unexpectedly.
