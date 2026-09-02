# Empty State

## Purpose

Empty State is an organism that fills a space with no content yet - an empty list, a cleared inbox, a
search with no results - with a centered illustration, a heading, a short description, and optional
actions that help the user move forward.

## When to use

Use Empty State for a legitimately empty view: an empty list/table/feed, a search or filter that
returned nothing, or a first-run state before the user has created anything.

## When not to use

Do not use Empty State for an error or a failed load; use Section Message (or Banner) with the error
appearance. Do not use it for a transient, auto-dismissing message; use Toast. Do not use it as a
loading placeholder; use Skeleton or Spinner.

## Design intent

Empty State is a centered, vertical stack composed of an optional illustration and a message block
(heading, description, actions). Only the description (`children`) is required; the illustration,
heading, and actions are optional slots. Everything is centered, so long headings and descriptions
wrap symmetrically.

`type` sets the background treatment: `inherited` (the default) is transparent and blends into the
surface beneath it - use it inside a card, panel, or table that already has a background;
`informative` fills its own sunken surface panel for a more self-contained empty state. The heading
uses `heading-md` and the description `body-md`, both in the default content color.

## Accessibility expectations

Empty State is plain content, not a live region, so it has no default `role`. When it is swapped in
dynamically - for example after a search returns nothing - the surrounding region should announce the
change (`role="status"` or `aria-live="polite"` on that region). The heading is styled text; pass a
real heading element (`h2`/`h3`) as the `heading` when a document-outline heading is needed.

## Related components

- Section Message
- Banner
- Skeleton / Spinner
- Button / Button Group / Link (composed inside)
