# Toast - Generation Prompt

This is the prompt used to originally generate the Toast organism. Kept as a historical record;
update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes rather
than this file.

## Task

Build a `Toast` organism for the LegacyHQ design system, matching the Figma `toast` component set
(`Components v1.0.0`, node `1565:12728`).

## What it is

A raised, transient notification card: a leading status tile (or a spinner while loading), a title,
an optional description and actions, and a dismiss button. Shown and stacked by Toast Group.

## Requirements

- Tier: organism. Files: `toast.tsx`, `Toast.stories.tsx`, `Toast.test.tsx`, `toast.module.css`,
  `toast.types.ts`, `toast.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` (root `div`) + `React.memo`. Compose IconTile, Spinner, IconButton, StatusIcons.

### Props

```ts
type ToastAppearance = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  appearance?: ToastAppearance; // default 'default'
  title: React.ReactNode;
  description?: React.ReactNode; // shown when expanded
  actions?: React.ReactNode;     // shown when expanded
  expanded?: boolean;            // default true
  isDismissible?: boolean;       // default true
  onDismiss?: () => void;
}
```

### Appearance mapping (from Figma)

default -> IconTile gray + dot; success -> green; info -> blue; warning -> orange; error -> red;
loading -> Spinner (no tile).

### Layout tokens (from Figma)

inline-size 368px, padding/root-gap `--spacing-lg`, content/actions gap `--spacing-sm`, border
`--border-width-sm`/`--color-border-default`, radius `--border-radius-xl`, surface
`--color-elevation-surface-raised-default`, overlay elevation shadow, title `heading-xs`, description
`body-md`.

### Behavior

- IconTile per appearance, or Spinner for loading.
- Title always; description + actions only when `expanded`.
- Dismiss unless `isDismissible` is false; `role="status"` default.

## Deliverables

Component files + the full doc set + `toast.mdx`, an entry under Organisms in `llms.txt`, and
regenerated `registry.json` / `exemplars.json`.
