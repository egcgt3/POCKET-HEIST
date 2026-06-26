---
name: project-conventions
description: Established code conventions in pocket-heist discovered during reviews
metadata:
  type: project
---

## Prop spread pattern is intentional

`{...h}` spread of full `Heist` objects onto card components (HeistCard, ExpiredHeistCard) is the established pattern for passing props. TypeScript excess-property checking is bypassed by the variable-spread form. Do not flag this as a new issue when reviewing — flag only when it introduces a *new* type-safety gap not seen elsewhere.

**Why:** Reduces boilerplate at the callsite; heist shape is consistent across cards.
**How to apply:** When a new card component is added via spread, only flag it if it deviates from the 5-prop pattern or introduces a coercion workaround not already present.

## Loading state composition pattern

Active and assigned heist hooks compose their `loading` states into a shared `const loading` for the top grid. Independently-rendered sections (e.g., the Past Heists section) manage their own loading state inline. Do not flag `expiredLoading` not being included in `loading` — this is intentional sectional isolation.

## `@reference` path convention

CSS modules under `app/(dashboard)/<page>/` use `@reference "../../globals.css"`.
CSS modules under `components/<ComponentName>/` use `@reference "../../app/globals.css"`.
Both resolve to `app/globals.css` at the repo root.

## Firestore date handling

The `heistConverter` in `types/firestore/heist.ts` calls `.toDate()` on Firestore timestamps for both `createdAt` and `deadline`. Components that call `deadline.toLocaleDateString()` are safe — the converter guarantees a native `Date`.

## `finalStatus` type gap in Heist

`Heist.finalStatus` is typed `"success" | "failure" | null`. The `useHeists("expired")` hook filters out null values at runtime but TypeScript doesn't narrow the array type after `.filter()`. Callsites use `h.finalStatus ?? "failure"` as a workaround. The correct fix is a type predicate filter:
`docs.filter((h): h is Heist & { finalStatus: "success" | "failure" } => h.finalStatus !== null)`
