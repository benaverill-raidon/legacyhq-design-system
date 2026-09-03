# Banner - Specification

## Overview

Banner is a full-width, page-level announcement bar. It belongs to the organism tier and composes
the Icon primitive and, in typical usage, the Button / Button Group actions passed into its
`actions` slot.

## Anatomy

1. **Root** - a `div` rendered as a full-width bar with the appearance's bold background. Height
   hugs the single message row plus block padding.
2. **Message** - a horizontal group of the leading icon and the message text.
   - **Icon slot** - the leading status icon (`warning`/`error`) or a plain dot. Decorative
     (`aria-hidden`). Inherits the banner content color.
   - **Text** - the `children`, truncated to a single line with an ellipsis.
3. **Actions** - an optional trailing region for inverse-tone actions. Rendered only when `actions`
   is provided.

## Public API

```ts
export type BannerAppearance = 'default' | 'warning' | 'error';

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: BannerAppearance;
  children: React.ReactNode;
  showIcon?: boolean;
  actions?: React.ReactNode;
}
```

## Default Props

```txt
appearance = 'default'
showIcon = true
role = 'status'
```

## Variants

`appearance` sets the bold background and the leading status icon. The Figma `appearance` variant
`appearance4` maps to `default` in code.

### Default

- background: `color-background-neutral-bold-default`
- content/icon: `color-content-inverse`
- icon: a plain dot (no dedicated default status glyph, matching Figma and Inline Message)

### Warning

- background: `color-background-warning-bold-default`
- content/icon: `color-content-warning-bold`
- icon: the warning status glyph

### Error

- background: `color-background-error-bold-default`
- content/icon: `color-content-inverse`
- icon: the error status glyph

## Layout and tokens

- padding-inline: `--spacing-2xl` (24px)
- padding-block: `--spacing-sm` (8px)
- root gap (message ↔ actions): `--spacing-sm` (8px)
- message gap (icon ↔ text): `--spacing-xs` (4px)
- actions gap: `--spacing-xs` (4px)
- icon slot size: `--size-300` (matches the Icon primitive's `spacing="spacious"` container)
- dot size: `--size-marker-sm`
- message typography: `body-md`

Height is not fixed - the bar hugs its content vertically, so the message row plus block padding
determine its height.

## Behavior

- Set the bold background and content color from `appearance`.
- Render the warning/error status icon, or a plain dot when there is no status glyph. The icon
  inherits the banner content color via the `[data-color]` override (the same pattern Button uses),
  not its own status color.
- Omit the leading icon when `showIcon` is false.
- Truncate the message to a single line with an ellipsis rather than wrapping.
- Render the actions region only when `actions` is provided.

## Accessibility

- Default `role="status"` (a polite live region). Overridable - `role="alert"` for urgent errors, or
  removed for a purely decorative bar.
- The leading icon slot is `aria-hidden`.
- Appearance is conveyed by the message text, not by color alone.

## Composition

- Actions match the bar. On `default` and `error` (dark bars) pass `isInverse` Buttons (or a
  `ButtonGroup` of them). On `warning` (amber, dark content) use `tone="warning"` Buttons (with
  `appearance="primary"`, since tone is inert otherwise) instead of the inverse treatment.
- Keep the action count low (one or two).

## Storybook

Documentation structure:

- Playground
- Appearances
- Content (message only, without icon, with actions, single action)
- Edge Cases (long message truncation, narrow viewport)

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders the message
defaults to role status and the default appearance
allows the role to be overridden
applies the appearance class
renders a status icon for warning/error and a dot for default
hides the icon when showIcon is false
marks the icon slot aria-hidden
renders actions when provided
omits the actions region when no actions
composes a custom className and forwards props
forwards the ref to the root element
CSS contract: appearance background/content tokens, spacing tokens, single-line truncation, icon color inheritance
```
