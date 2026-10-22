# Toast Group - Completion Checklist

## Component name

Toast Group

## Description

Pins a bottom-right stack of Toasts and provides the imperative `toast()` API. A 3D collapsed stack
expands into a vertical list on hover/focus, with auto-dismiss (pause on hover), swipe-to-dismiss,
and a max-visible cap. Code-only behavior component (no Figma node).

## Status

Stable.

## Component tier

Organism.

## Design decisions

- [ ] Imperative API: mount one `ToastGroup`; call `toast()`/`toast.success/error/warning/information/loading`
      and `toast.dismiss(id?)` from anywhere (module-level store, no context). `toast.info` stays as
      a deprecated alias of `toast.information`.
- [ ] A loading toast has no dismiss button unless it passes `isDismissible`; resolved to another
      tone, it gets one back unless the update passes `isDismissible`.
- [ ] Newest toast at the front; up to `maxVisible` (default 3) stacked, the rest collapsed behind.
- [ ] Collapsed = 3D pile (peek + scale down); expanded (hover/focus) = spaced vertical list.
- [ ] Auto-dismiss after `duration` in view (default 5000; loading = Infinity until it resolves, then
      the group's duration unless one is passed); timers pause while expanded and resume with the
      time left; a queued toast's timer starts only once it's in view.
- [ ] Swipe/drag past a threshold dismisses; exit animates out before removal.
- [ ] Reuse an id to update a toast in place (loading -> success/error).
- [ ] Stack movement uses `--move-long`, opacity `--fade-long`; the exit timer matches the 300ms fade.
- [ ] Reduced motion collapses transitions to instant.
- [ ] Behavior follows shadcn/sonner; there is no Figma component for the group.

## Code props

```ts
interface ToastGroupProps {
  maxVisible?: number; // default 3
  duration?: number;   // default 5000
  label?: string;      // default 'Notifications'
  className?: string;
}
```

## Defaults

```txt
maxVisible: 3
duration: 5000
label: Notifications
```

## Tokens / constants

- [ ] region inset `--spacing-xl`; region width 368px, capped to viewport.
- [ ] collapsed peek 16px, scale step 0.05, expanded gap 8px, swipe threshold 80px.

## Accessibility

- [ ] `aria-label`led list region; an always-mounted, visually hidden `role="status"` live region
      announces each toast in view (cards are `role="none"`, so no double announcement).
- [ ] Focus into the stack expands it and pauses auto-dismiss; it stays expanded while focus is
      inside, even when the pointer leaves.
- [ ] Dismissed from the keyboard, focus moves to the next toast, else the previous, else back to
      where it came from, else the page; a pointer click leaves focus alone.
- [ ] Queued toasts (past `maxVisible`) are `inert` and `aria-hidden`.

## Examples to document

- [ ] Mount the group
- [ ] Success toast
- [ ] Loading updated to success (same id)
- [ ] Toast with an action
- [ ] Dismiss all

## Tests

- [ ] Renders only an empty live region when empty; renders a triggered toast in an aria-labelled list.
- [ ] Tone from the variant helpers; update in place by id.
- [ ] Dismiss button + auto-dismiss remove the toast.
- [ ] All toasts in the DOM while stacked, newest first.
- [ ] Hover expands to reveal descriptions.
- [ ] A resolved loading toast gets the group's duration (or the one passed).
- [ ] Queued toasts are inert/aria-hidden and their timers wait until they're in view.
- [ ] The live region stays mounted and announces new, updated, and newly visible toasts once.
- [ ] Hover and focus pause the timers, which resume with the time left; focus keeps the stack expanded.
- [ ] `toast.information` sets information; `toast.info` still does the same.
- [ ] A loading toast has no dismiss button and gets it back when it resolves; an `isDismissible`
      it set doesn't pass on to its result.
- [ ] Focus after a keyboard dismiss: next toast, previous toast, skips unfocusable and queued
      toasts, back to where it came from, the page as a last resort; a pointer click leaves it.
- [ ] Uses MUI: no. Uses Tailwind: no.
