# Toast - Specification

## Overview

Toast is a raised, transient notification card. It belongs to the organism tier and composes the
Icon Tile molecule, the Spinner and Icon Button atoms, and the shared Status icon set. Toasts are
shown and stacked by Toast Group.

## Anatomy

1. **Root** - a `div` rendered as a raised-surface card (1px border, radius-xl, overlay shadow),
   laid out as a horizontal row.
2. **Leading icon** - an Icon Tile colored per appearance, or a Spinner for `loading`. Decorative.
3. **Content** - a vertical column:
   - **Title row** - the title (`heading-xs`) plus the dismiss Icon Button.
   - **Description** - optional (`body-md`, subtle), shown when expanded.
   - **Actions** - optional Buttons, shown when expanded.

## Public API

```ts
export type ToastAppearance = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  appearance?: ToastAppearance;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  expanded?: boolean;
  isDismissible?: boolean;
  onDismiss?: () => void;
}
```

## Default Props

```txt
appearance = 'default'
expanded = true
isDismissible = true
role = 'status'
```

## Variants

`appearance` selects the leading visual. Each non-loading appearance maps to an Icon Tile tone plus a
status glyph (default has no glyph, so a dot stands in). `loading` shows a Spinner.

```txt
default  -> IconTile tone gray, dot
success  -> IconTile tone green, success glyph
info     -> IconTile tone blue, information glyph
warning  -> IconTile tone orange, warning glyph
error    -> IconTile tone red, error glyph
loading  -> Spinner (no tile)
```

## Layout and tokens

- inline-size: `368px`, max `100%`
- padding: `--spacing-lg`; root gap: `--spacing-lg`; content gap: `--spacing-sm`; actions gap: `--spacing-sm`
- border: `--border-width-sm` solid `--color-border-default`; radius: `--border-radius-xl`
- surface: `--color-elevation-surface-raised-default`
- shadow: the overlay elevation shadow (`--color-elevation-shadow-overlay-spread` / `-perimeter`)
- title: `heading-xs`, `--color-content-default`; description: `body-md`, `--color-content-subtle`
- spinner slot: `--size-300`; default dot: `--size-marker-sm`

## Behavior

- Render the Icon Tile (per-appearance tone) or the Spinner for `loading`.
- Always render the title; render the description and actions only when `expanded` and provided.
- Show the dismiss button unless `isDismissible` is false; call `onDismiss` on click.

## Accessibility

- Default `role="status"` (polite live region), overridable.
- Leading icon decorative; dismiss button labelled "Dismiss".

## Storybook

- Playground
- Appearances
- ExpandedCollapsed
- Content

## Tests

```txt
renders the title
defaults to role status
sets a data-appearance attribute
shows the description and actions only when expanded
renders a status tile for a non-loading appearance
renders a spinner for the loading appearance
shows a dismiss button by default and calls onDismiss
omits the dismiss button when isDismissible is false
forwards the ref to the root element
CSS contract: raised surface + radius-xl + 1px border + overlay shadow
```
