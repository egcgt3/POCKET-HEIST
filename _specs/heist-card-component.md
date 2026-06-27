# Spec for heist-card-component

branch: claude/feature/heist-card-component
figma_component (if used): https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev

## Summary

Implement a `HeistCard` component that displays a single heist's summary information. Cards are rendered in a 3-column grid on the `/heists` dashboard page, showing only **active** and **assigned** heists (expired heists are excluded). The heist title links to the detail page (`/heists/:id`), though that page has no content yet. A `HeistCardSkeleton` component mirrors the card layout and is shown in the same grid while data is loading.

## Functional Requirements

- Display only heists with a status of `active` or `assigned` — never `expired`
- Each card shows: heist title (as a link to `/heists/:id`), deadline, status badge, and assigned crew count (or similar summary fields derived from the Firestore schema)
- Cards are laid out in a 3-column CSS grid on the `/heists` page
- `HeistCardSkeleton` occupies the same grid cell dimensions as a real card and is shown while heist data is being fetched
- Clicking the heist title navigates to `/heists/:id`; the detail page route exists but renders no content yet

## Figma Design Reference

- File: Page Designs — `elHzuUQZiJXNqJft57oneh`
- Node ID: `54-60`
- Link: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev
- **Note:** Automated design extraction was unavailable (Figma account is view-only). Review the Figma node manually before implementing to confirm exact spacing, colour tokens, typography, and any icons used on the card.

## Possible Edge Cases

- No heists exist yet: the grid should be empty (or show a friendly empty state — out of scope for this spec, but don't crash)
- All heists are expired: same empty grid behaviour
- Heist title is very long: card should truncate or wrap gracefully without breaking the grid
- Crew count is zero or undefined: show a sensible fallback (e.g. "No crew assigned")
- Data fetch is slow: skeleton cards fill all three columns until real data arrives
- `/heists/:id` is visited directly: the route must exist and render without errors, even if empty

## Acceptance Criteria

- [ ] `HeistCard` renders heist title, deadline, status badge, and crew count
- [ ] Heist title is an anchor linking to `/heists/:id` using Next.js `<Link>`
- [ ] Only heists with status `active` or `assigned` are rendered; `expired` heists are filtered out
- [ ] Cards are displayed in a 3-column CSS grid on the `/heists` page
- [ ] `HeistCardSkeleton` matches the card dimensions and is rendered in the same 3-column grid while loading
- [ ] `/heists/:id` route exists and renders without errors (content is intentionally empty)
- [ ] No Tailwind utility classes are applied directly in JSX beyond a single class per element; all multi-class styling uses `@apply` in a CSS Module

## Open Questions

- Which Firestore fields map to the card's status badge — is it the `status` field on the heist document?
- Should the skeleton show a fixed number of placeholder cards (e.g. 3 or 6), or match the expected count from a previous fetch? 3
- Does "assigned" mean the current user is assigned, or that at least one crew member is assigned? current user
- Is there a dedicated empty-state design in Figma when no active/assigned heists exist? no

## Testing Guidelines

Create a test file at `tests/components/HeistCard.test.tsx` and cover the following cases without going too heavy:

- Renders heist title, deadline, and status badge from props
- Heist title renders as a link pointing to `/heists/:id`
- Expired heists are not rendered when the card list is filtered
- `HeistCardSkeleton` renders without crashing and matches the card's structural wrapper
