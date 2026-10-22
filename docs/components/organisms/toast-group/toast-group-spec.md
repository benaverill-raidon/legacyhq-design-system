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
toast(title, options?)          // default tone
toast.success(title, options?)
toast.error(title, options?)
toast.warning(title, options?)
toast.information(title, options?)
toast.info(title, options?)     // deprecated alias of toast.information
toast.loading(title, options?)  // no dismiss button; stays until updated or dismissed
toast.dismiss(id?)              // one, or all when id is omitted

// options: { id?, description?, actions?, duration?, isDismissible?, tone? }
```

Reuse an `id` to update a toast in place (loading -> success/error). A loading toast that resolves
to another tone gets the group's `duration` and its dismiss button back unless the update passes
`duration` or `isDismissible`.

## Behavior

- **Store.** A module-level observer store holds the toasts (newest first) and notifies the group; no
  React context is required for `toast()`.
- **Stacking.** Up to `maxVisible` toasts show; collapsed, toast `i` gets `translateY(-i * 16px)` and
  `scale(1 - i * 0.05)`; deeper toasts are hidden. Expanded, each toast translates up by the
  cumulative height of the toasts in front of it plus an 8px gap.
- **Expand.** The stack is expanded while it's hovered or while focus is inside it (two separate
  flags). Pointer leave clears only the hover flag, so the stack stays expanded while focus is inside;
  focus-out to outside the region clears the focus flag. Both reset when the last toast goes, and the
  focus flag also resets when the focused toast is removed.
- **Auto-dismiss.** Each toast dismisses after it has been in view for its `duration` (default from
  the group; a `loading` toast defaults to `Infinity`; `Infinity`/0 disables it). The timer pauses
  while the stack is expanded, while the toast is queued (past `maxVisible`), and while it exits; it
  keeps the time left and resumes from it. A queued toast's timer doesn't start until it's in view.
  An update (same id) or a new duration starts the timer over.
- **Dismiss button.** Shown unless the toast's `isDismissible` is `false`. A `loading` toast with no
  `isDismissible` has none (the group passes `isDismissible ?? !isLoading` to Toast), since it's
  replaced with its result rather than closed.
- **Update in place.** `add` merges the new options over the old item (`{ ...old, ...new }`), so an
  option left out keeps its earlier value. The exceptions: when a `loading` toast is updated to another
  tone, its `duration` and `isDismissible` are dropped unless the update passes them, so the result
  gets the group's `duration` and a dismiss button. Each add or update bumps the item's `revision`.
- **`toast.dismiss`** removes from the store immediately (no exit fade); only the dismiss button
  and swipe run the fade first.
- **Swipe.** Pointer drag past 80px dismisses; otherwise it snaps back. The transform transition is
  disabled while dragging so the toast follows the pointer.
- **Exit.** Dismissal fades the toast out with `--fade-long` (300ms), and the toast is removed from the
  store once that fade has finished (the removal timer matches `--duration-slow`).
- **Motion.** The stack's physical movement - each toast's transform and the region's height - uses
  `--move-long`; appearing and disappearing (opacity) uses `--fade-long`.
- **Reduced motion.** Transitions collapse to instant.

## Layout and tokens

- region inset: `--spacing-xl` from the bottom-right; region width `368px`, capped to the viewport.
- constants: collapsed peek 16px, scale step 0.05, expanded gap 8px, swipe threshold 80px.

## Accessibility

- The region is an `aria-label`led list. The `ol` renders only while there are toasts.
- A visually hidden `role="status"` live region (`aria-atomic="false"`) is always rendered, even with
  no toasts. It holds one entry (status prefix, title, description) per toast in view, keyed by id and
  revision, so a new toast, an updated toast, and a queued toast coming into view are each added to it
  and announced. The Toast cards render with `role="none"`, so nothing is announced twice.
- Focusing into the stack expands it and pauses auto-dismiss; it stays expanded while focus is inside.
- **Focus after a keyboard dismiss.** When a toast's dismiss button is activated from the keyboard (a
  click with `detail === 0`) while focus is in that toast, focus moves before the toast fades: to the
  first focusable element of the next toast in the list (older), else the previous one (newer),
  skipping toasts that are queued (`inert`), already exiting, or have nothing to focus; else back to
  the element focus came from when it entered the stack (recorded from `relatedTarget` on focus-in);
  else, if that's gone or can't take focus, the focused button is blurred, leaving focus on the page.
  A pointer click (`detail > 0`) leaves focus alone, so the stack collapses when the pointer leaves.
  Swipes and timers don't move focus (timers are paused while focus is inside).
- Hidden (queued) items are `inert` and `aria-hidden="true"` (plus `opacity: 0`, `pointer-events:
  none`): out of the accessibility tree and the tab order.
- Not portaled: the list renders where `ToastGroup` is mounted (fixed-positioned), which sets its
  place in the tab order. No hotkey, and Escape does not dismiss.

## Storybook

- Playground (interactive trigger buttons + the group)

## Tests

```txt
renders only an empty live region when there are no toasts
renders a toast triggered via the imperative API
sets the tone from the toast variant helpers
updates a toast in place when the same id is reused (loading -> success)
keeps a loading toast until it is updated or dismissed
gives a resolved loading toast the group's duration when the update passes none
gives a resolved loading toast the duration the update passes
dismisses a toast when its dismiss button is clicked
auto-dismisses after the duration elapses
keeps every toast in the DOM while stacked, newest first
caps the visible stack at maxVisible and keeps the rest out of the accessibility tree and tab order
doesn't start a waiting toast's timer until it's in view
keeps a live region on the page and announces each toast through it, once
announces an updated toast as a new entry
announces a waiting toast only when it comes into view
expands to reveal descriptions when the stack is hovered
pauses the timers while hovered and resumes them with the time that was left
stays expanded and paused while focus is inside, even after the pointer leaves
collapses again when the focused toast is removed
sets information from toast.information, and still accepts the deprecated toast.info
gives a loading toast no dismiss button, and gives it back when the toast resolves
doesn't pass a loading toast's isDismissible on to its result unless the update sets it
focus after a keyboard dismiss: moves to the next toast in the list
focus after a keyboard dismiss: moves to the previous toast when it was the last one in the list
focus after a keyboard dismiss: skips a toast with nothing to focus, and one that's waiting past maxVisible
focus after a keyboard dismiss: goes back to where focus was before it entered the stack when no toast is left
focus after a keyboard dismiss: falls back to the page when focus came from nowhere it can go back to
focus after a keyboard dismiss: leaves focus alone after a pointer click
```
