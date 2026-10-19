# Tabs - Specification

## Overview

Tabs is an accessible tab bar (over optional panels) with two appearances, `line` and `contained`. It
belongs to the organism tier and composes the shared Focus Ring primitive. `TabPanel` is a companion
component for the panels.

## Anatomy

1. **Root** - a `div` (`data-appearance`) laid out as a column: the tab list, then the panels.
2. **Tab list** - a `div role="tablist"` (`aria-label`/`aria-labelledby`, `aria-orientation`).
3. **Tab** - a `button role="tab"` with `id`, `aria-selected`, `aria-controls` (only while its
   `TabPanel` is rendered), roving `tabindex`,
   and the native `disabled` attribute.
4. **Indicator** - `line`: a 3px `::after` underline on the selected tab over the tab list's bottom
   border; `contained`: a selected-surface pill.
5. **Panel** - `TabPanel` (`div role="tabpanel"`, `id`, `aria-labelledby`, `tabindex=0`), hidden and
   emptied when not selected.

## Public API

```ts
export type TabsAppearance = 'line' | 'contained';
/** @deprecated */
export type TabsType = TabsAppearance;

export interface TabItem { value: string; label: React.ReactNode; disabled?: boolean; }

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  appearance?: TabsAppearance;
  /** @deprecated Use `appearance`. Still accepted. */
  type?: TabsAppearance;
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  showBorder?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: React.ReactNode;
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}
```

## Default Props

```txt
appearance = 'line'
defaultValue = first enabled tab
showBorder = true
```

## Variants

`appearance` sets the visual style (`type` is its deprecated alias; Figma still calls the axis
`type`).

### Line (default)

- selected: label `content/selected` + a 3px `content/selected` underline.
- unselected: label `content/subtle`, darkening to `content/default` on hover.
- a `border/default` bottom border under the tab list (`showBorder`, default on).

### Contained

- the tab list is a segmented container: a `border/radius/xl` box on the
  `elevation/surface/raised/default` surface, with a `border/default` border and `spacing/xs` padding
  around the pills (the border is toggled by `showBorder`, default on).
- radius-lg pill tabs inside it.
- selected: `background/selected/default/default` fill + `border/selected` border + `content/selected`
  label.
- unselected: transparent, darkening to `content/default` on hover.

## Layout and tokens

- tab padding: block `--spacing-075` (6px), inline `--spacing-sm` (8px)
- root gap (tab list ↔ panels): `--spacing-lg`
- tab list border: `--border-width-sm` / `--color-border-default`
- line indicator: `--border-width-lg` (3px) / `--color-content-selected`
- contained tab radius: `--border-radius-lg`; tab (focus) radius: `--border-radius-sm`
- contained container: radius `--border-radius-xl`, padding `--spacing-xs`, background
  `--color-elevation-surface-raised-default`, border `--color-border-default`
- label: `heading-xs`

## Behavior

- Render the tab list from `tabs` (data-driven, matching Menu's style); select the first enabled tab
  by default (or `defaultValue`).
- Controlled with `value` + `onValueChange`; uncontrolled otherwise.
- Wire each `TabPanel` to its tab and show only the selected panel. A tab sets `aria-controls` only
  while its `TabPanel` is rendered (panels register with Tabs through context), so a tab bar used
  alone has no dangling id references.
- Roving tabindex - only the selected tab is tabbable; if `value`/`defaultValue` matches no enabled
  tab, the first enabled tab is the tab stop.
- Arrow keys (wrapping) + Home/End move selection, skipping disabled tabs (automatic activation).
- Do not select disabled tabs.

## Accessibility

- Label the tab list; tabs/panels carry the standard tab ARIA.
- Keyboard: Left/Right/Up/Down (wrap), Home, End.
- Focus uses the shared Focus Ring; disabled via native `disabled`.

## Storybook

- Playground
- Types (line vs contained)
- States (disabled tab, no border)
- Controlled

## Tests

```txt
renders a labelled tablist with a tab per item
selects the first enabled tab by default
honors defaultValue
selects a tab on click and shows its panel
wires each panel to its tab with ARIA
uses roving tabindex
moves selection with arrow keys, skipping disabled tabs
supports Home and End
does not select a disabled tab
supports controlled selection
applies the appearance on the root (and the deprecated type)
CSS contract: line indicator over the border; contained selected fill + border + radius
```
