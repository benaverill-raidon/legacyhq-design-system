# Toast - Specification

## Overview

Toast is a raised, transient notification card. It belongs to the organism tier and composes the
Icon Tile molecule, the Spinner and Icon Button atoms, and the shared Status icon set. Toasts are
shown and stacked by Toast Group.

## Anatomy

1. **Root** - a `div` rendered as a raised-surface card (1px border, radius-xl, overlay shadow),
   laid out as a horizontal row.
2. **Leading icon** - an Icon Tile colored per tone, or a Spinner for `loading`. Decorative.
3. **Content** - a vertical column:
   - **Title row** - the title (`heading-xs`) plus the dismiss Icon Button.
   - **Description** - optional (`body-md`, subtle), shown when expanded.
   - **Actions** - optional Buttons, shown when expanded.

## Public API

```ts
export type ToastTone = 'default' | 'success' | 'information' | 'warning' | 'error' | 'loading';
// 'info', the earlier name, is still accepted as a deprecated alias of 'information'.

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: ToastTone | 'info';
  /** @deprecated Renamed to `tone`. Still accepted. */
  appearance?: ToastTone | 'info';
  statusLabel?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  expanded?: boolean;
  isDismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
  role?: React.AriaRole;
}
```

## Default Props

```txt
tone = 'default'
expanded = true
isDismissible = true
role = 'status'
```

## Variants

`tone` selects the leading visual. Each non-loading tone maps to an Icon Tile tone plus a
status glyph (default has no glyph, so a dot stands in). `loading` shows a Spinner.

```txt
default  -> IconTile tone taupe, dot
success  -> IconTile tone green, success glyph
information -> IconTile tone blue, information glyph
warning  -> IconTile tone orange, warning glyph
error    -> IconTile tone red, error glyph
loading  -> Spinner (no tile)
```

## Layout and tokens

- inline-size: `368px`, max `100%`
- padding: `--spacing-lg`; root gap: `--spacing-lg`; content gap: `--spacing-sm`; actions gap: `--spacing-sm`
- border: `--border-width-sm` solid `--color-border-default`; radius: `--border-radius-xl`
- surface: `--color-elevation-surface-raised-default`
- shadow: the overlay elevation shadow (`--elevation-shadow-overlay`)
- title: `heading-xs`, `--color-content-default`; description: `body-md`, `--color-content-subtle`
- spinner slot: `--size-300`; default dot: `--size-marker-sm`

## Behavior

- Render the Icon Tile (per-tone tone) or the Spinner for `loading`.
- Always render the title; render the description and actions only when `expanded` and provided.
- Show the dismiss button unless `isDismissible` is false; call `onDismiss` on click. Toast never
  hides itself; the caller (Toast Group) removes it.
- The dismiss Icon Button keeps Icon Button's default tooltip, which shows its accessible name
  (`dismissLabel`) on hover and focus, the same as Section Message's. Inside Toast Group the tooltip
  is drawn behind the stack for now: Popup's portal sits at `z-index: 1` and the group at `1000`
  (the layering task recorded in token-governance.json's `elevation.layering`).

## Accessibility

- Default `role="status"` (polite live region), overridable.
- Leading icon decorative; dismiss button labelled by `dismissLabel` ("Dismiss" by default).
- Because the icon is decorative, `success`, `information`, `warning`, and `error` announce their status before the title as visually hidden text ("Success:", "Information:", "Warning:", "Error:"), from `statusLabel` (defaults to the tone's name; pass a translation, or an empty string to omit). `default` and `loading` announce none.

## Storybook

- Playground
- Tones
- ExpandedCollapsed
- Content

## Tests

```txt
renders the title
defaults to role status
sets a data-tone attribute
shows the description and actions only when expanded
renders a status tile for a non-loading tone
renders a spinner for the loading tone
shows a dismiss button by default and calls onDismiss
omits the dismiss button when isDismissible is false
forwards the ref to the root element
CSS contract: raised surface + radius-xl + 1px border + overlay shadow
```
