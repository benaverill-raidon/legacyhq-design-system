# Toast Group - Completion Checklist

## Component name

Toast Group

## Description

Pins a bottom-right stack of Toasts and provides the imperative `toast()` API. A 3D collapsed stack
expands into a vertical list on hover/focus, with auto-dismiss (pause on hover), swipe-to-dismiss,
and a max-visible cap. Code-only behavior component (no Figma node).

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] Imperative API: mount one `ToastGroup`; call `toast()`/`toast.success/error/warning/info/loading`
      and `toast.dismiss(id?)` from anywhere (module-level store, no context).
- [ ] Newest toast at the front; up to `maxVisible` (default 3) stacked, the rest collapsed behind.
- [ ] Collapsed = 3D pile (peek + scale down); expanded (hover/focus) = spaced vertical list.
- [ ] Auto-dismiss after `duration` (default 5000; loading = Infinity); timers pause while expanded.
- [ ] Swipe/drag past a threshold dismisses; exit animates out before removal.
- [ ] Reuse an id to update a toast in place (loading -> success/error).
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

- [ ] `aria-label`led list region; each toast `role="status"`.
- [ ] Focus into the stack expands it and pauses auto-dismiss.

## Examples to document

- [ ] Mount the group
- [ ] Success toast
- [ ] Loading updated to success (same id)
- [ ] Toast with an action
- [ ] Dismiss all

## Tests

- [ ] Renders nothing when empty; renders a triggered toast in an aria-labelled list.
- [ ] Appearance from the variant helpers; update in place by id.
- [ ] Dismiss button + auto-dismiss remove the toast.
- [ ] All toasts in the DOM while stacked, newest first.
- [ ] Hover expands to reveal descriptions.
- [ ] Uses MUI: no. Uses Tailwind: no.
