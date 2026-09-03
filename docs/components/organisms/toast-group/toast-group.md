# Toast Group

## Purpose

Toast Group is an organism that pins a stack of Toasts to the bottom-right of the viewport and
provides the imperative `toast()` API. Toasts stack in a compact three-dimensional pile and expand
into a spaced vertical list on hover or focus.

## When to use

Use Toast Group once, near the app root, to show transient notifications from anywhere via
`toast()`. Reach for it whenever a brief, non-blocking status should surface app-wide.

## When not to use

Do not use it for persistent, in-context messages (Section Message), full-width announcements
(Banner), or blocking confirmations (Modal Dialog). Do not render more than one Toast Group.

## Design intent

Toast Group is a code-only behavior component - there is no Figma component for the group; it stacks
the `toast` component, and its stacking/hover-expand behavior follows shadcn/sonner (specified by the
design owner). A module-level observer store backs `toast()` so it works without a React context.

Newest toasts sit at the front; up to `maxVisible` (default 3) show stacked, the rest collapse
behind them. Collapsed, older toasts peek up and scale down; hovering or focusing the stack expands
it into a spaced vertical list. Each toast auto-dismisses after its `duration` (paused while the
stack is hovered/focused), and can be swiped away. Reusing a toast id updates it in place - the
pattern for a `loading` toast that resolves.

## Accessibility expectations

The stack is an `aria-label`led list region; each toast is a polite `role="status"`. Focusing into
the stack expands it and pauses auto-dismiss, so keyboard users can reach the dismiss buttons and
actions. Transitions collapse to instant under `prefers-reduced-motion`. Toasts should carry
redundant, non-critical information.

## Related components

- Toast (the individual card this group stacks)
- Section Message / Banner (for persistent, non-transient messages)
