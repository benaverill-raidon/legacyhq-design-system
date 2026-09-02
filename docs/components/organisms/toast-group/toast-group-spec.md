# Toast Group - Specification

## Overview

Toast Group pins a stack of Toasts to the bottom-right of the viewport and provides the imperative
`toast()` API. It is a code-only behavior component (no Figma node) that stacks the Toast organism
following shadcn/sonner behavior.

## Anatomy

1. **Region** - a fixed, bottom-right, `aria-label`led `ol` that grows/shrinks between the collapsed
   and expanded layouts.
2. **Item** - an absolutely-positioned `li` around each Toast, transformed via inline CSS custom
   properties (`--toast-y`, `--toast-scale`, `--toast-x`) for the stack, expanded, and swipe states.

## Public API

```ts
export interface ToastGroupProps {
  maxVisible?: number; // default 3
  duration?: number;   // default 5000 (ms)
  label?: string;      // default 'Notifications'
  className?: string;
}
```

### Imperative API (`toast`)

```ts
toast(title, options?)          // default appearance
toast.success(title, options?)
toast.error(title, options?)
toast.warning(title, options?)
toast.info(title, options?)
toast.loading(title, options?)  // duration Infinity by default
toast.dismiss(id?)              // one, or all when id is omitted

// options: { id?, description?, actions?, duration?, isDismissible?, appearance? }
```

Reuse an `id` to update a toast in place (loading -> success/error).

## Behavior

- **Store.** A module-level observer store holds the toasts (newest first) and notifies the group; no
  React context is required for `toast()`.
- **Stacking.** Up to `maxVisible` toasts show; collapsed, toast `i` gets `translateY(-i * 16px)` and
  `scale(1 - i * 0.05)`; deeper toasts are hidden. Expanded, each toast translates up by the
  cumulative height of the toasts in front of it plus an 8px gap.
- **Expand.** Pointer enter or focus-in sets the expanded state (and pauses timers); pointer leave or
  focus-out (outside the region) collapses it.
- **Auto-dismiss.** Each toast dismisses after its `duration` (default from the group; `Infinity`/0
  disables it). Timers pause while expanded.
- **Swipe.** Pointer drag past 80px dismisses; otherwise it snaps back. The transform transition is
  disabled while dragging so the toast follows the pointer.
- **Exit.** Dismissal animates out (opacity) before the toast is removed from the store.
- **Reduced motion.** Transitions collapse to instant.

## Layout and tokens

- region inset: `--spacing-xl` from the bottom-right; region width `368px`, capped to the viewport.
- constants: collapsed peek 16px, scale step 0.05, expanded gap 8px, swipe threshold 80px.

## Accessibility

- The region is an `aria-label`led list; each toast is a polite `role="status"`.
- Focusing into the stack expands it and pauses auto-dismiss.

## Storybook

- Playground (interactive trigger buttons + the group)

## Tests

```txt
renders nothing when there are no toasts
renders a toast triggered via the imperative API
sets the appearance from the toast variant helpers
updates a toast in place when the same id is reused
dismisses a toast when its dismiss button is clicked
auto-dismisses after the duration elapses
keeps every toast in the DOM while stacked, newest first
expands to reveal descriptions when the stack is hovered
```
