# Plan: Login Form Auth

## Context

The `AuthForm` component already handles signup via `createUserWithEmailAndPassword`. The login path (`mode="login"`) currently ends with a `console.log` — it needs to be wired to Firebase's `signInWithEmailAndPassword`. On success, the form fields should be cleared and an inline "You're logged in!" message shown. No redirect is needed; auth state propagates reactively through `AuthContext`.

---

## Modified Files

### 1. `components/AuthForm/AuthForm.tsx`

- Import `signInWithEmailAndPassword` from `firebase/auth` (alongside the existing `createUserWithEmailAndPassword`).
- Extend `FIREBASE_ERRORS` with login-specific codes:
  - `"auth/invalid-credential"` → `"Incorrect email or password."`
  - `"auth/user-not-found"` → `"Incorrect email or password."` (same copy — avoids user enumeration)
  - `"auth/wrong-password"` → `"Incorrect email or password."`
  - `"auth/too-many-requests"` → `"Too many attempts. Please try again later."`
- Add a `success` state: `const [success, setSuccess] = useState(false)`.
- Replace the `console.log` at the bottom of `handleSubmit` with the login flow:
  - Set `submitting(true)`, clear `firebaseError` and `success`.
  - Call `await signInWithEmailAndPassword(auth, email, password)`.
  - On success: `setSuccess(true)`, clear `email` and `password` fields.
  - On failure: map error code via `FIREBASE_ERRORS`, fall back to generic message.
  - `finally`: `setSubmitting(false)`.
- Render a success message below the submit button (conditional on `success`), using a new `.successMsg` CSS class. The existing `firebaseError` display pattern sits in the same slot — they are mutually exclusive.

### 2. `components/AuthForm/AuthForm.module.css`

Add `.successMsg` styled similarly to `.errorMsg` but using a success/green token (e.g. `var(--color-success)` if it exists in `app/globals.css`, otherwise a plain green value). Keep the same `text-sm` size and `role="status"` pattern.

### 3. `tests/components/AuthForm.test.tsx`

Extend the existing test file. Add `signInWithEmailAndPassword` to the existing `firebase/auth` mock. Add a new `describe("login mode — firebase")` block:

- Calls `signInWithEmailAndPassword` with email and password on valid submission.
- Shows "You're logged in!" after successful sign-in.
- Clears email and password fields after success.
- Disables the submit button while the request is in flight (mock a delayed promise).
- Shows `"Incorrect email or password."` for `auth/invalid-credential`.
- Shows `"Too many attempts. Please try again later."` for `auth/too-many-requests`.
- Shows generic fallback for an unmapped error code.
- Does not throw if `signInWithEmailAndPassword` rejects unexpectedly.

Existing tests must remain unaffected — they already mock `firebase/auth`, so extending that mock is safe.

---

## Verification

```bash
npm test -- tests/components/AuthForm.test.tsx --run
npm run build
npm run dev  # log in with a valid account, confirm "You're logged in!" appears and fields are cleared
             # try wrong password, confirm error message appears
```
