# Plan: Authentication Forms (Login & Signup)

branch: claude/feature/auth-forms
spec: _specs/auth-forms.md

## Context

The `/login` and `/signup` pages are currently placeholders with only a heading. This plan adds functional authentication forms to both pages — email + password fields, a show/hide password toggle (Lucide Eye/EyeOff), light inline validation, and console logging on submit. No backend integration yet. Users can switch between forms via a navigation link.

---

## Approach

Create a single shared `AuthForm` Client Component with a `mode: "login" | "signup"` prop. Both forms are structurally identical and only differ in button label, heading, and cross-link text — a `mode` prop handles all three variations cleanly. Page files stay as Server Components and simply render `<AuthForm mode="..." />`.

---

## Files to Create

| File | Purpose |
|---|---|
| `components/AuthForm/AuthForm.tsx` | Client Component — all form state, validation, and render logic |
| `components/AuthForm/AuthForm.module.css` | Scoped styles for form, inputs, toggle, errors, submit button |
| `components/AuthForm/index.ts` | Barrel export |
| `tests/components/AuthForm.test.tsx` | Full test suite |

## Files to Update

| File | Change |
|---|---|
| `app/(public)/login/page.tsx` | Replace placeholder heading with `<AuthForm mode="login" />` |
| `app/(public)/signup/page.tsx` | Replace placeholder heading with `<AuthForm mode="signup" />` |

---

## Component Design

**State** (`useState`):
- `email`, `password` — controlled input values
- `showPassword: boolean` — toggles input type between `"password"` and `"text"`
- `emailError`, `passwordError` — inline validation messages

**Submit handler** (`e.preventDefault()`):
1. If email or password is empty, set the relevant error and return early
2. Otherwise clear errors and call `console.log({ email, password })`

**Mode-derived values**:
- `buttonLabel`: `"Log In"` | `"Sign Up"`
- Cross-link text + `href` to the other form

**Accessibility**:
- `htmlFor`/`id` pairing on every label+input
- `role="alert"` on error spans
- `aria-label` on the toggle button (`"Show password"` / `"Hide password"`)
- `type="button"` on toggle (prevents form submit)
- `noValidate` on form (we own validation UX)
- `autoComplete="email"`, `autoComplete="current-password"` / `"new-password"`

---

## CSS Module

`components/AuthForm/AuthForm.module.css` — starts with `@reference "../../app/globals.css"`.

Key classes:
- `.form` — card style, max-width ~400px, `var(--color-light)` background, `var(--color-lighter)` border
- `.fieldGroup` — wraps label + input (+ optional error) for one field
- `.label` — block, small font, `var(--color-body)` color
- `.input` — full-width, dark background, focus ring using `var(--color-primary)`
- `.passwordWrapper` — `position: relative`; input gets `padding-right` so text doesn't overlap the icon
- `.toggleBtn` — `position: absolute; right; top: 50%` inside wrapper; reset button styles, `var(--color-body)` color
- `.errorMsg` — `color: var(--color-error)`, small, `display: block`
- `.submitBtn` — `@apply btn` + `width: 100%`
- `.altLink` — centered navigation line at the bottom of the form

---

## Tests (`tests/components/AuthForm.test.tsx`)

Follow existing pattern (React Testing Library, `vi.spyOn` for `console.log`).

**Rendering (login mode):** email input present, password input defaults to `type="password"`, submit button labelled "Log In", link to `/signup`.

**Rendering (signup mode):** submit button labelled "Sign Up", link to `/login`.

**Password toggle:** clicking toggles type to `"text"` then back to `"password"`; aria-label updates accordingly.

**Validation:** submit with empty fields → errors shown, `console.log` not called; individual empty field errors are isolated.

**Successful submit:** both fields filled → `console.log({ email, password })` called; no navigation.

Use `userEvent` (from `@testing-library/user-event`) for all interactions.

---

## Verification

1. `nvm use 20.9.0 && npm test -- tests/components/AuthForm.test.tsx --run`
2. `npm run dev` → visit `/login` and `/signup`
3. Confirm: form renders, toggle works, empty submit shows errors, filled submit logs to console
4. Confirm cross-links navigate between `/login` ↔ `/signup`
