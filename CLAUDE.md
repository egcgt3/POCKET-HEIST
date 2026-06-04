# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start the Next.js development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run test     # Run all tests with Vitest (watch mode)
```

Run a single test file:
```bash
npm test -- tests/components/Navbar.test.tsx --run
```

> **Note:** Tests require Node ≥ 20. If `npm test` fails with a `node:fs/promises` error, run `nvm use 20.9.0` first.

## Architecture

**Next.js App Router** with two route groups that share the root layout (`app/layout.tsx`):

- `app/(public)/` — unauthenticated pages (login, signup, landing, preview). Uses a minimal layout wrapping children in `<main className="public">`. No navbar.
- `app/(dashboard)/` — authenticated pages under `/heists`. Layout wraps children with the persistent `<Navbar>` component.

The splash page (`app/(public)/page.tsx`) is intended as an auth-gating entry point — redirect to `/heists` when logged in, `/login` when not. Auth logic is not yet implemented.

**Path alias:** `@/` maps to the repo root (e.g. `@/components/Navbar`, `@/app/globals.css`).

## Styling

Two complementary approaches are used together:

1. **Tailwind CSS v4** — utility classes in JSX and `@apply` in CSS files. The full design token set (colours, font) is defined via `@theme` in `app/globals.css` and must be imported with `@reference "../../app/globals.css"` in any CSS Module that uses those tokens.
2. **CSS Modules** (`.module.css`) — scoped styles for components (e.g. `Navbar.module.css`).

**Important:** `@apply` in CSS modules only works with real Tailwind utilities — not custom global classes like `.btn`. To reuse `.btn` styles in a module, copy the underlying utilities and `var()` declarations directly.

## Testing

Vitest with `happy-dom` environment and React Testing Library. The `vitest/globals` types are injected via `tsconfig.json`, so `describe`/`it`/`expect` are available without explicit imports. Tests live in `tests/` mirroring the source structure (e.g. `tests/components/`). Use `userEvent` from `@testing-library/user-event` for interaction tests.

## Hooks

A `PostToolUse` hook runs Prettier on any `.ts`/`.tsx` file after every `Write` or `Edit` call. Expect files to be reformatted automatically — if your next edit targets a reformatted region, `Read` the file first to get the current content.

## Custom Slash Commands

Located in `.claude/commands/`:

- `/commit-message` — analyzes staged diff and proposes a commit message (emoji + type + body). Always asks for confirmation before committing.
- `/component <description>` — TDD scaffold: writes tests first, creates the component (`.tsx`, `.module.css`, `index.ts`), runs tests, then adds to the preview page at `/preview`.
- `/spec <description>` — creates a feature spec in `_specs/` and switches to a new `claude/feature/<slug>` branch. Aborts if the working tree is dirty.

## Feature Planning Workflow

- `_specs/<slug>.md` — human-readable feature spec (requirements, edge cases, acceptance criteria)
- `_plans/<slug>.md` — implementation plan (approach, files, CSS, tests, verification steps)

Specs and plans are committed alongside code so planning context is version-controlled.

## Additional Coding Preferences

- Do NOT apply tailwind classes directly in component templates unless essential or just 1 at most. If an element needs more than a single tailwind class, combine them into a custom class using the `@apply` directive.
- Use minimal project dependencies where possible.
- Use the `git switch -c` command to switch to new branches, not `git checkout`.
