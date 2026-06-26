# Spec for expired-heist-card

branch: claude/feature/expired-heist-card
figma_component (if used): N/A

## Summary

Implement an `ExpiredHeistCard` component that displays a single expired heist's summary information. The card is visually distinct from the active/assigned `HeistCard` — using muted colours and an expired status indicator — so users can immediately distinguish past heists from live ones. Expired cards are rendered in their own section or grid on the `/heists` dashboard page (or a dedicated `/heists/expired` view, to be decided during planning). A matching `ExpiredHeistCardSkeleton` is shown while data loads.

## Functional Requirements

- Display only heists with a status of `expired` (deadline has passed)
- Each card shows: heist title (as a plain text label or non-navigable link), deadline (formatted as a past date), and an "Expired" status badge
- The expired badge and overall card colour palette must be visually distinct from the `active` (green) and `assigned` (purple) badges on `HeistCard`
- Optionally display the assigned crew codename with a fallback of "No crew assigned"
- An `ExpiredHeistCardSkeleton` placeholder occupies the same grid cell dimensions as a real `ExpiredHeistCard` and is shown while heist data is being fetched
- No navigation to `/heists/:id` is required from the expired card (the detail route exists but expired heists are out of scope for detail viewing)

## Figma Design Reference

No Figma design reference was provided. Implement visual differentiation using the existing design token set from `app/globals.css`:
- Use a muted/greyed-out colour token for the card surface and text
- Use a distinct colour (e.g. `--color-danger` or a grey tone) for the "Expired" badge to signal inactivity
- Replicate the same card shell dimensions and structure as `HeistCard` so both sit consistently in a grid

## Possible Edge Cases

- No expired heists exist: render nothing or an empty state message (do not crash)
- Heist title is very long: card must truncate or wrap without breaking the grid layout
- Crew codename is missing or empty: show "No crew assigned" fallback
- Deadline date is malformed or missing: gracefully omit the date rather than crashing
- Data fetch is slow: skeleton cards fill the grid until real data arrives

## Acceptance Criteria

- [ ] `ExpiredHeistCard` renders heist title, formatted deadline, "Expired" status badge, and crew codename
- [ ] The card's colour palette and badge styling are visually distinct from `HeistCard`'s active/assigned variants
- [ ] No Tailwind utility classes are applied directly in JSX beyond a single class per element; all multi-class styling uses `@apply` in a CSS Module
- [ ] `ExpiredHeistCardSkeleton` matches the card dimensions and renders in the same grid while loading
- [ ] The component follows the three-file convention: `ExpiredHeistCard.tsx`, `ExpiredHeistCard.module.css`, `index.ts`
- [ ] Expired heists are sourced via the existing `useHeists("expired")` hook call — no new data-fetching logic is added to the component itself
- [ ] Renders without errors when no expired heists exist

## Open Questions

- Should expired cards link to `/heists/:id`, or is the title rendered as plain text?
- Where on the `/heists` page should expired heists appear — below the active/assigned grid, in a collapsible section, or on a separate `/heists/expired` route?
- Should expired cards display the same crew codename field, or a different summary field (e.g. who created the heist)?
- Is there a fixed number of skeleton placeholders to show while loading (e.g. 3), or should it match a previously cached count?

## Testing Guidelines

Create a test file at `tests/components/ExpiredHeistCard.test.tsx` and cover the following cases without going too heavy:

- Renders heist title, formatted deadline, and "Expired" badge from props
- Renders crew codename when provided; falls back to "No crew assigned" when empty
- `ExpiredHeistCardSkeleton` renders without crashing and contains the card wrapper element
- Does not render active or assigned heists when they are excluded from the input array
