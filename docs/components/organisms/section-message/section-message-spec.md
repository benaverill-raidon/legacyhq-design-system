# Section Message - Specification

## Overview

Section Message is a bordered, rounded, in-context status panel. It belongs to the organism tier and
composes the Icon primitive, the Link atom (actions), and the Icon Button atom (dismiss).

## Anatomy

1. **Root** - a `div` rendered as a bordered, rounded box with the appearance's tinted background and
   colored border. Horizontal layout: icon, content column, optional dismiss button.
2. **Icon slot** - the status icon for the appearance, in its own status color. Decorative
   (`aria-hidden`).
3. **Content** - a vertical column:
   - **Title** - optional bold lead line (`heading-sm`, default content color).
   - **Description** - the `children`, wrapping across lines (`body-md`, default content color).
   - **Actions** - optional `Link`s with an inserted middot between each.
4. **Dismiss** - optional dismiss `IconButton` (xs, subtle) in the top-right.

## Public API

```ts
export type SectionMessageAppearance = 'information' | 'success' | 'warning' | 'error';

export interface SectionMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  appearance?: SectionMessageAppearance;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isDismissible?: boolean;
  onDismiss?: () => void;
}
```

## Default Props

```txt
appearance = 'information'
isDismissible = false
role = 'status'
```

## Variants

`appearance` sets the tinted background, the border color, and the status icon. The Figma
`discovery` appearance was removed by the designer; code ships four appearances.

### Information

- background: `color-background-information-subtle-default`
- border: `color-border-information`
- icon: the information status glyph, `color-content-information`

### Success

- background: `color-background-success-subtle-default`
- border: `color-border-success`
- icon: the success status glyph, `color-content-success`

### Warning

- background: `color-background-warning-subtle-default`
- border: `color-border-warning`
- icon: the warning status glyph, `color-content-warning`

### Error

- background: `color-background-error-subtle-default`
- border: `color-border-error`
- icon: the error status glyph, `color-content-error`

The title and description always use `color-content-default`; only the icon and border carry the
status color.

## Layout and tokens

- padding: `--spacing-lg` (16px)
- root gap (icon ↔ content ↔ dismiss): `--spacing-lg` (16px)
- content gap (title ↔ description ↔ actions): `--spacing-sm` (8px)
- actions gap (between links and middots): `--spacing-xs` (4px)
- border: `--border-width-sm` (1px)
- radius: `--border-radius-xl`
- title typography: `heading-sm`
- description typography: `body-md`
- separator color: `--color-content-subtle`

The panel hugs its content vertically; the description wraps rather than truncating.

## Behavior

- Set the tinted background, border color, and status icon from `appearance`.
- The icon keeps its own status color (unlike Banner, whose icon inherits the bar color).
- Render the title only when provided; render the actions region only when actions are provided.
- Insert a middot between each action. A single top-level fragment passed to `actions` is unwrapped
  so each Link is separated.
- Show the dismiss button only when `isDismissible`. On dismiss, hide the message (internal state)
  and call `onDismiss`.

## Accessibility

- Default `role="status"` (a polite live region). Overridable - `role="alert"` for urgent errors.
- The status icon slot is `aria-hidden`.
- The dismiss button is a labelled `IconButton` ("Dismiss").
- Appearance is conveyed by the title/description text, not by color alone.

## Storybook

Documentation structure:

- Playground
- Appearances
- Content (title/description/actions, description only, single action, dismissible)
- Edge Cases (long wrapping content, dismissible with actions, no title)

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders the description
renders the title when provided and omits it otherwise
defaults to role status and the information appearance
applies the appearance class
renders a status icon
allows the role to be overridden
interleaves a middot between actions
renders no separator for a single action
omits the actions region when none
is not dismissible by default
dismisses and calls onDismiss when the dismiss button is clicked
composes a custom className and forwards props
forwards the ref to the root element
CSS contract: appearance background/border tokens, radius-xl, 1px border, spacing-lg padding
```
