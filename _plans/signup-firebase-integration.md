# Plan: Signup Firebase Integration with Generated Codename

## Context

The signup form at `app/(public)/signup/` renders `AuthForm` in `signup` mode. Currently `handleSubmit` only validates fields and logs to the console — no Firebase call is made. This plan wires it to Firebase Auth (`createUserWithEmailAndPassword`), generates a PascalCase animal-themed codename, sets it as `displayName`, writes a `users` Firestore document, and redirects to `/heists` on success.

---

## New Files

### 1. `lib/generateCodename.ts`
Pure function with no Firebase dependency. Three word sets (at least 10 words each), all heist/animal themed:
- **Set 1 — Adjectives:** Swift, Silent, Shadow, Cunning, Phantom, Sly, Bold, Grim, Wily, Midnight, Slick, Rogue
- **Set 2 — Colours/modifiers:** Crimson, Onyx, Golden, Silver, Scarlet, Iron, Cobalt, Ivory, Amber, Obsidian, Copper, Jade
- **Set 3 — Animals:** Fox, Wolf, Raven, Viper, Lynx, Crow, Hawk, Jackal, Ferret, Panther, Cobra, Mink

Export a single `generateCodename(): string` that picks one word randomly from each set and returns them concatenated in PascalCase (e.g. `SilentOnyxRaven`).

### 2. `tests/lib/generateCodename.test.ts`
- Output matches `/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/` (three PascalCase words)
- Sample 100 calls — each result's first word belongs to Set 1, middle to Set 2, last to Set 3

---

## Modified Files

### 3. `components/AuthForm/AuthForm.tsx`

**New imports:**
- `createUserWithEmailAndPassword`, `updateProfile` from `"firebase/auth"`
- `setDoc`, `doc` from `"firebase/firestore"`
- `auth`, `db` from `"@/lib/firebase"`
- `generateCodename` from `"@/lib/generateCodename"`
- `useRouter` from `"next/navigation"`

**New state:**
- `submitting: boolean` — disables the submit button while the async flow is pending
- `firebaseError: string` — displays Firebase-level errors below the submit button

**Updated `handleSubmit` (signup mode only):**
1. Run existing field validation; bail early if invalid
2. Set `submitting = true`, clear `firebaseError`
3. `const cred = await createUserWithEmailAndPassword(auth, email, password)`
4. `const codename = generateCodename()`
5. `await updateProfile(cred.user, { displayName: codename })`
6. `await setDoc(doc(db, "users", cred.user.uid), { id: cred.user.uid, codename })` — no email field
7. `router.push("/heists")`
8. On catch: map Firebase error codes to friendly strings; set `firebaseError`
9. Finally: `submitting = false`

**Login mode:** leave existing `console.log` stub untouched — out of scope.

**Error code → message map:**
| Firebase code | Message shown |
|---|---|
| `auth/email-already-in-use` | "An account with this email already exists." |
| `auth/weak-password` | "Password must be at least 6 characters." |
| `auth/invalid-email` | "Please enter a valid email address." |
| (default) | "Something went wrong. Please try again." |

**Submit button:** add `disabled={submitting}` prop.

**Firebase error display:** render `firebaseError` in a `<span role="alert">` below the submit button, reusing the existing `styles.errorMsg` class.

**Firestore write:** use `setDoc(doc(db, "users", uid), ...)` so the document ID equals the UID, making future lookups trivial.

### 4. `tests/components/AuthForm.test.tsx` (already exists — add new describe block)
Mock pattern (matching existing test conventions):
```
vi.mock("firebase/auth", ...)       // createUserWithEmailAndPassword, updateProfile
vi.mock("firebase/firestore", ...)  // setDoc, doc
vi.mock("@/lib/firebase", ...)      // auth: {}, db: {}
vi.mock("next/navigation", ...)     // useRouter → { push: vi.fn() }
vi.mock("@/lib/generateCodename", ...) // fixed return "SilentOnyxRaven"
```

Tests to add inside `describe("signup mode — Firebase")`:
- Calls `createUserWithEmailAndPassword` with correct email + password on submit
- After success, calls `updateProfile` with `{ displayName: "SilentOnyxRaven" }`
- After success, calls `setDoc` with `{ id: uid, codename: "SilentOnyxRaven" }` — assert no `email` key
- On `auth/email-already-in-use` rejection, shows friendly inline error
- Submit button is `disabled` while the promise is pending; re-enabled after it settles

---

## Verification

```bash
npm test -- tests/lib/generateCodename.test.ts --run
npm test -- tests/components/AuthForm.test.tsx --run
npm run build
npm run dev  # manually submit the signup form; check Firebase console for new user + users doc
```
