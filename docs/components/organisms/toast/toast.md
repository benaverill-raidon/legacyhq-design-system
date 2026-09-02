# Toast

## Purpose

Toast is an organism: a raised, transient notification card. It shows a brief, non-blocking status
with a leading status tile (or a spinner while loading), a title, an optional description and
actions, and a dismiss button. On its own it is the presentational card; toasts are shown and
stacked by Toast Group through the imperative `toast()` API.

## When to use

Use Toast for a brief, transient confirmation or status that does not interrupt the task - changes
saved, an upload result, a pending operation (`loading`) that later resolves to success or error.

## When not to use

Do not use Toast for a persistent, in-context status; use Section Message. Do not use it for a
full-width page-level announcement; use Banner. Do not use it for a blocking confirmation; use Modal
Dialog. Never put the only copy of a critical message, or the only path to an action, in a toast.

## Design intent

Toast is a presentation organism that composes the Icon Tile molecule (the colored status tile), the
Spinner atom (loading), the Icon Button atom (dismiss), and the Status icon set. `appearance`
(`default`, `success`, `info`, `warning`, `error`, `loading`) selects the leading visual. The card
renders on a raised surface with a 1px border and the overlay elevation shadow so it reads above the
page.

`expanded` controls whether the description and actions show - a collapsed toast is compact (title
only), an expanded one reveals its detail. Toast Group drives this from its collapsed/hovered state.

## Accessibility expectations

Each toast is a `role="status"` (polite) region so screen readers announce it without interrupting.
The leading icon is decorative; the dismiss button is a labelled Icon Button. Because toasts are
transient, they should carry redundant, non-critical information.

## Related components

- Toast Group
- Section Message
- Banner
- Icon Tile / Spinner / Icon Button (composed inside)
