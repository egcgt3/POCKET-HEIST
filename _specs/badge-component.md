# Spec for badge-component

branch: claude/feature/badge-component
figma_component (if used): N/A

## Summary

A reusable `Badge` component that renders a small pill-shaped label with a colour that varies by variant. The component consolidates the inline `.badge` spans currently duplicated in `HeistCard` and `ExpiredHeistCard` into a single shared primitive. Each variant maps to a semantic colour from the design token set.

## Functional Requirements

- Accepts a `variant` prop that controls both the display label and the colour scheme. Supported variants: `active`, `assigned`, `success`, `failure`.
- Renders a visible text label appropriate to each variant:
  - `active` → "Active"
  - `assigned` → "Assigned"
  - `success` → "Mission Complete"
  - `failure` → "Mission Failed"
- Colour per variant (text / background):
  - `active` → `--color-success` / success tint (green)
  - `assigned` → `--color-primary` / primary tint (purple)
  - `success` → `--color-success` / success tint (green)
  - `failure` → `--color-error` / error tint (red)
- Styling must match the existing pill shape: `text-xs`, `font-semibold`, `rounded-full`, `padding: 0.125rem 0.5rem`, `self-start`.
- Replace the inline `.badge` `<span>` elements in `HeistCard` and `ExpiredHeistCard` with the new `Badge` component.
- Remove the now-redundant `.badge` CSS rules from both card CSS Modules after the component is wired in.

## Possible Edge Cases

- An unknown or missing `variant` value should render nothing (return `null`) rather than an unstyled badge.
- The component should not accept arbitrary label overrides — the label is determined entirely by the variant to keep usage simple and prevent inconsistencies.

## Acceptance Criteria

- `Badge` renders the correct label for each of the four variants.
- `Badge` applies the correct colour scheme for each variant (verified visually and/or via computed class/style assertions in tests).
- `HeistCard` and `ExpiredHeistCard` use `Badge` instead of their own inline badge spans.
- The duplicate `.badge[data-mode]` and `.badge[data-status]` CSS rules are removed from `HeistCard.module.css` and `ExpiredHeistCard.module.css`.
- Existing card tests continue to pass after the refactor.
- An unknown `variant` renders nothing without throwing.

## Open Questions

- Should the badge support a custom `aria-label` prop for cases where the visible text is not descriptive enough for screen readers? (Currently "Active" / "Assigned" / "Mission Complete" / "Mission Failed" appear self-explanatory.) yes

## Testing Guidelines

Create a test file in `tests/components/Badge.test.tsx` and cover the following cases, without going too heavy:

- Renders the correct label string for each of the four variants (`active`, `assigned`, `success`, `failure`).
- Applies the correct CSS variant class (or data attribute) that drives the colour for each variant.
- Returns nothing (null / empty) for an unrecognised variant value.
- Snapshot or structural test: the rendered element is a `<span>` (or equivalent inline element) with the expected class.
