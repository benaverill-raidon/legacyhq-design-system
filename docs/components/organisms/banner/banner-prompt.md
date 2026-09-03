# Banner - Generation Prompt

This is the prompt used to originally generate the Banner organism. Kept as a historical record of
the intent; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral
changes rather than this file.

## Task

Build a `Banner` organism for the LegacyHQ design system, matching the Figma `banner` component set
(`Components v1.0.0`, node `1550:131564`) 1:1.

## What it is

A full-width, page-level announcement bar. It carries a single high-visibility message on a bold
background, with an optional leading status icon and optional inline actions.

## Requirements

- Tier: organism. Files follow the repo convention: `banner.tsx`, `Banner.stories.tsx`,
  `Banner.test.tsx`, `banner.module.css`, `banner.types.ts`, `banner.mdx`, `index.ts`.
- Styling: CSS Modules + semantic design tokens only. No MUI, no Tailwind, no hardcoded
  colors/typography/spacing. Passes `npm run lint:css`.
- Use `React.forwardRef` (to the root `div`) and `React.memo`.

### Props

```ts
type BannerAppearance = 'default' | 'warning' | 'error';

interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: BannerAppearance; // default 'default'
  children: React.ReactNode;     // the message; truncates to a single line
  showIcon?: boolean;            // default true
  actions?: React.ReactNode;     // optional trailing inverse-tone actions
}
```

### Appearance mapping (from Figma bound variables)

- default (Figma `appearance4`): bg `color-background-neutral-bold-default`, content
  `color-content-inverse`, icon = a plain dot (no default status glyph).
- warning: bg `color-background-warning-bold-default`, content `color-content-warning-bold`, icon =
  warning status glyph.
- error: bg `color-background-error-bold-default`, content `color-content-inverse`, icon = error
  status glyph.

The icon inherits the banner content color (not its own status color) via the `[data-color]`
override Button uses.

### Layout tokens (from Figma bound variables)

padding-inline `--spacing-2xl`, padding-block `--spacing-sm`, root gap `--spacing-sm`, message gap
`--spacing-xs`, actions gap `--spacing-xs`, icon slot `--size-300`, dot `--size-marker-sm`, message
typography `body-md`. Height hugs content (no fixed height).

### Behavior

- Bold background + content color from `appearance`.
- Status icon for warning/error; a dot for default; omit the icon when `showIcon` is false.
- Message truncates to a single line with an ellipsis.
- Actions region rendered only when `actions` is provided.
- `role="status"` by default, overridable; leading icon `aria-hidden`.

### Composition

Actions are inverse-tone Buttons (the Figma banner uses `tone=inverse` Button instances, which map
to the code `isInverse` boolean) - typically in a `ButtonGroup`. Keep the action count low.

## Deliverables

Component files + the full doc set (`banner.md`, `banner-spec.md`, `banner-checklist.md`,
`banner.contract.json`, `banner.examples.json`), a Storybook `banner.mdx`, an entry under the
Organisms heading of `llms.txt`, and regenerated `registry.json` / `exemplars.json`.
