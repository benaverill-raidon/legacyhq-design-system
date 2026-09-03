# Toast Group - Generation Prompt

This is the prompt used to originally generate the Toast Group organism. Kept as a historical
record; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes
rather than this file.

## Task

Build a `ToastGroup` organism for the LegacyHQ design system: an imperative toast system that stacks
the `Toast` component with shadcn/sonner behavior. There is no Figma component for the group.

## What it is

A fixed bottom-right stack of Toasts plus an imperative `toast()` API. Collapsed, toasts stack in a
3D pile; hovering/focusing expands them into a spaced vertical list. Toasts auto-dismiss (paused on
hover), can be swiped away, and cap at `maxVisible`.

## Requirements

- Tier: organism. Files: `toast-group.tsx`, `toast-store.ts`, `ToastGroup.stories.tsx`,
  `ToastGroup.test.tsx`, `toast-group.module.css`, `toast-group.types.ts`, `toast-group.mdx`,
  `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/spacing.
- Render the `Toast` component per item.

### Public API

```ts
interface ToastGroupProps {
  maxVisible?: number; // default 3
  duration?: number;   // default 5000
  label?: string;      // default 'Notifications'
  className?: string;
}

// imperative
toast(title, options?)                 // + success/error/warning/info/loading
toast.dismiss(id?)
// options: { id?, description?, actions?, duration?, isDismissible?, appearance? }
```

### Behavior

- Module-level observer store backs `toast()` (no React context). Newest toast at the front.
- Up to `maxVisible` shown; collapsed = `translateY(-i*16px) scale(1 - i*0.05)`, deeper hidden;
  expanded = translate each toast up by the cumulative height of the toasts in front of it + an 8px
  gap. Measure toast heights (ResizeObserver, guarded).
- Pointer enter / focus-in expands and pauses timers; pointer leave / focus-out collapses.
- Auto-dismiss after `duration` (Infinity/0 disables); pause while expanded.
- Swipe/drag past 80px dismisses (disable the transform transition while dragging).
- Exit animates out before removal. Reduced motion -> instant.
- Reuse an id to update a toast in place (loading -> success/error).

### Layout tokens

Region inset `--spacing-xl`, region width 368px capped to viewport, `z-index` above app content.

## Deliverables

Component files + the full doc set + `toast-group.mdx`, an entry under Organisms in `llms.txt`, and
regenerated `registry.json` / `exemplars.json`.
