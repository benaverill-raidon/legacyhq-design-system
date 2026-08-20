# Inline Message

## Purpose
Inline Message shows a short, tone-colored status line inline in the page, with optional additional
detail revealed in a popup on click.

## When to use
Use for a save confirmation, a validation summary, a sync state, or any short status line that
sometimes needs more explanation than fits on one line.

## When not to use
Do not use for a hover-only supplemental hint (use Tooltip), for content essential to completing a
task with no fallback, or as a page-level banner/toast.

## Design intent
Inline Message renders through [Popup](../../primitives/popup/popup.md) with its default styled
skin (a raised card, not `unstyled` like Tooltip) when `content` is provided - this is the first
component in the system to exercise Popup's own visual skin rather than substituting a custom one.
The row is a real `<button>`, not a hover target: Popup's own guidance is that hover-only reveals
belong to Tooltip, so Inline Message opens on click (or Enter/Space), matching Figma's `pressed`
trigger state and staying accessible to keyboard and touch users alike.

`closeOnEscape` and `closeOnOutsideClick` are both `false` on the underlying Popup - the detail
panel persists until the row is clicked again, rather than dismissing on a stray click or Escape
press. This was Popup's own documented prediction for Inline Message's likely behavior, now
implemented directly.

`tone="default"` falls back to a plain CSS dot in place of a status icon - Figma's own `default`
tone trigger uses an unrelated generic placeholder glyph rather than a real one, and no matching
icon exists in the generated icon set.

## Accessibility
The row is a real, focusable `<button>` when `content` is provided, with `aria-expanded`/
`aria-controls` managed automatically by Popup, and the shared Focus Ring primitive supplying its
`:focus-visible` outline - the same pattern every other interactive component in this system uses.
Keyboard focus shows the same tint as hover, not a separate treatment. Omit `content` and the row
renders as plain, non-interactive text with no button at all.

## Related
Popup, Tooltip.
