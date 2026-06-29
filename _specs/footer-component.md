# Spec for footer-component

branch: claude/feature/footer-component
figma_component (if used): N/A

## Summary
Add a persistent Footer component to the main dashboard layout that displays a copyright notice. The year in the copyright line must be derived from the current date at runtime so it never needs a manual update.

## Functional Requirements
- A `Footer` component renders a copyright line: "© Copyright Heists <current-year>"
- The current year is computed dynamically from the runtime date (e.g. `new Date().getFullYear()`)
- The Footer is rendered inside the dashboard layout so it appears on all authenticated pages
- The Footer is positioned at the bottom of the page, after main content

## Possible Edge Cases
- Year rolls over at midnight on January 1 — the dynamic year ensures no manual update is needed
- Footer must not overlap or obscure page content on short-viewport devices

## Acceptance Criteria
- The Footer renders on the `/heists` dashboard page
- The copyright year matches the current calendar year automatically
- The Footer sits visually at the bottom of the viewport or below the page content
- No hardcoded year value appears in the component source

## Open Questions
- Should the Footer also appear on public (unauthenticated) pages, or only in the dashboard layout? on all public unauthenticated pages.

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Renders the copyright notice with the correct current year
- Does not render a hardcoded year (year matches `new Date().getFullYear()`)
