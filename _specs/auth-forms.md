# Spec for auth-forms

branch: claude/feature/auth-forms
figma_component (if used): N/A

## Summary

Add login and signup forms to the existing `/login` and `/signup` public pages. Each form collects an email and password, with a toggle to show/hide the password. On submission, form data is logged to the console (no backend integration yet). Users can navigate between the two forms via a link.

## Functional Requirements

- The `/login` page renders a login form with:
  - An email input field
  - A password input field with a show/hide toggle icon
  - A submit button labelled "Log In"
  - A link to the `/signup` page ("Don't have an account? Sign up")
- The `/signup` page renders a signup form with:
  - An email input field
  - A password input field with a show/hide toggle icon
  - A submit button labelled "Sign Up"
  - A link to the `/login` page ("Already have an account? Log in")
- Clicking the show/hide icon toggles the password field between `type="password"` and `type="text"`
- On form submission, `console.log` the submitted email and password values
- Form submission must not navigate away or refresh the page
- Both pages already exist — only the form content needs to be added

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User submits with one or both fields empty
- User toggles password visibility multiple times before submitting
- User navigates between login and signup and back — form state should reset

## Acceptance Criteria

- Visiting `/login` shows a functional login form
- Visiting `/signup` shows a functional signup form
- The password field hides characters by default; the toggle icon reveals/hides them
- Submitting either form logs `{ email, password }` to the browser console
- A link on the login page navigates to signup, and vice versa
- Both forms are keyboard-accessible (tab order, Enter to submit)

## Open Questions

- Should empty field submission be silently ignored, or display inline validation errors? Light validation
- Should the show/hide icon use an existing Lucide icon (e.g. `Eye` / `EyeOff`), or a custom asset? Yes

## Testing Guidelines

Create test files in `./tests` mirroring the page structure. Focus on:

- Login form renders email field, password field, and submit button
- Signup form renders email field, password field, and submit button
- Password toggle changes input type between `password` and `text`
- Form submission calls `console.log` with the correct values
- Navigation links between login and signup pages are present and correct
