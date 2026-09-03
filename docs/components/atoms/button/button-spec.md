# Button Component Spec

## Overview

Button is an atom used to trigger an event or action. It communicates what will happen when a user activates it and provides a consistent action control across the design system.

Button should be used for user-initiated actions, not navigation-only links or icon-only controls.

## Folder Location

```txt
packages/ui/src/components/atoms/button/
```

## Required Files

```txt
button.tsx
button.types.ts
button.module.css
button.test.tsx
button.stories.tsx
index.ts
```

## Anatomy

```txt
Button
├─ leading icon or loading spinner
├─ content
└─ trailing icon
```

The loading spinner replaces the leading content area while preserving the original label/content width.

## Public API

```ts
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonAppearance = 'default' | 'primary' | 'subtle';

export type ButtonTone = 'neutral' | 'warning' | 'error';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  tone?: ButtonTone;
  isInverse?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
```

## Default Props

```ts
size = 'md'
appearance = 'default'
tone = 'neutral'
isInverse = false
type = 'button'
disabled = false
isLoading = false
isFullWidth = false
```

## Variants

### Size

| Size | Min height | Horizontal padding | Radius | Border width |
|---|---:|---|---|---|
| xs | 24px | `spacing-sm` | `border-radius-sm` | `border-width-default` |
| sm | 32px | `spacing-sm` | `border-radius-sm` | `border-width-default` |
| md | 40px | `spacing-150` | `border-radius-sm` | `border-width-default` |
| lg | 48px | `spacing-200` | `border-radius-sm` | `border-width-default` |

### Appearance

#### Default

A standard button for secondary or neutral actions. Usually bordered with a neutral surface.

#### Primary

A high-emphasis button for the primary action in a section, form, or workflow.

#### Subtle

A low-emphasis button for secondary, inline, or lower-priority actions.

### Tone

#### Neutral

Default action tone.

#### Warning

Used for actions that require caution.

#### Error

Used for destructive or high-risk actions.

## Appearance and Tone Matrix

| Appearance | Neutral | Warning | Error |
|---|---|---|---|
| default | standard neutral | warning outline/default | error outline/default |
| primary | primary brand | warning bold | error bold |
| subtle | neutral subtle | warning subtle | error subtle |

## States

- default
- hover
- press
- focus
- disabled
- loading

Selected/toggled behavior is intentionally excluded from Button and should be handled by a future ToggleButton component.

## Behavior

### Native Button

Button must render a native `<button>` element.

The default `type` must be `button` to avoid accidental form submission.

### Disabled

When `disabled` is true:

- pass the native `disabled` attribute
- prevent activation
- apply disabled visual treatment - bordered for `appearance="default"`, borderless for
  `appearance="primary"`/`appearance="subtle"` (see Color Token Intent > Disabled below)

### Loading

When `isLoading` is true:

- render a Spinner in the leading content area
- preserve the original content width
- prevent repeated activation
- apply loading visual behavior
- keep the action label visible when possible

The intended loading pattern is:

```txt
[ spinner  Save changes ]
```

not:

```txt
[ spinner ]
```

Button should not shrink when loading starts.

### Full Width

When `isFullWidth` is true:

- set button width to `100%`
- preserve internal alignment and spacing

### Icons

Button supports icons before and after content.

- `iconBefore`
- `iconAfter`

Icons should use the medium icon size for all button sizes.

Icon spacing should use `spacing-075` for all button sizes.

Do not add an icon-size prop.

Do not support icon-only buttons in this component.

## Design Tokens

### Component Tokens

Create component-level tokens for min-height:

```json
{
  "component": {
    "button": {
      "min-height": {
        "xs": { "value": "24px" },
        "sm": { "value": "32px" },
        "md": { "value": "40px" },
        "lg": { "value": "48px" }
      }
    }
  }
}
```

Expected CSS variables:

```css
--size-control-xs
--size-control-sm
--size-control-md
--size-control-lg
```

### Existing Tokens

Use existing semantic tokens for:

- padding-inline
- icon gap
- border radius
- border width
- typography
- color
- motion (transition duration/easing)

### Motion

Background, border, and content color changes across hover/press/focus transition using the `fade-quick` semantic motion token (`--duration-fast` + `--ease-standard`):

```css
transition: background-color var(--fade-quick), border-color var(--fade-quick), color var(--fade-quick);
```

Respect `prefers-reduced-motion: reduce` by zeroing `transition-duration`. Do not hardcode a duration or easing curve directly on the component — consume the semantic motion token so retiming propagates system-wide.

### Size Token Mapping

```css
/* xs */
block-size: var(--size-control-xs);
padding-inline: var(--spacing-sm);

/* sm */
block-size: var(--size-control-sm);
padding-inline: var(--spacing-sm);

/* md */
block-size: var(--size-control-md);
padding-inline: var(--spacing-md);

/* lg */
block-size: var(--size-control-lg);
padding-inline: var(--spacing-lg);
```

A fixed `block-size`, not a `min-block-size` floor: at `xs`, the `heading-xs` line-height (24px)
plus the 1px top/bottom border already sums to 26px, so a floor never actually constrains anything
and the button rendered 2px taller than `--size-control-xs` (`sm`/`md`/`lg` never showed this, since
their own token values comfortably exceed 26px). Fixing the size pins the box at exactly the token
value regardless - `overflow: visible` lets a sliver of the line-box spill silently, matching
IconButton's own already-fixed-size convention (`inline-size`/`block-size`, not `min-`).

Common values:

```css
border-radius: var(--border-radius-sm);
border-width: var(--border-width-sm);
gap: var(--spacing-sm);
```

## Color Token Intent

Use available semantic color tokens from the theme CSS.

### Default + Neutral

- border: `color-border-input`
- content: `color-content-subtle` or existing text/content subtle token
- background: transparent or surface/input token based on Figma

### Primary + Neutral

- background: `color-background-brand-bold-default`
- hover: `color-background-brand-bold-hover`
- pressed: `color-background-brand-bold-press`
- content/icon: `color-content-inverse`

### Primary + Warning

- background: `color-background-warning-bold-default`
- hover: `color-background-warning-bold-hover`
- pressed: `color-background-warning-bold-press`
- content/icon: `color-content-warning-inverse` where available, otherwise inverse token defined by theme

### Primary + Error

- background: `color-background-error-bold-default`
- hover: `color-background-error-bold-hover`
- pressed: `color-background-error-bold-press`
- content/icon: `color-content-inverse`

### Subtle

Use neutral or semantic subtle background tokens for hover/press states, with default transparent/no-fill base where appropriate.

If an exact semantic token is missing, document it and use the closest existing approved token from the generated theme files.

### Inverse (`isInverse`)

An orthogonal on-dark treatment for buttons placed on dark or bold-colored surfaces (e.g. Banner).
It is a boolean prop, not part of the `tone` axis, so it can later compose with any `appearance`
(the outlined `default` inverse treatment is planned). It overrides the resting appearance fill:

- background: transparent
- border: transparent
- content/icon: `color-content-inverse`
- hover: `color-background-neutral-overlay-subtle-hover` (white subtle, the mode-flipped mirror of the
  dark `color-background-neutral-overlay-bold-hover`)
- pressed: `color-background-neutral-overlay-subtle-press`
- focus: white subtle hover fill plus the shared focus ring

Declared after the appearance rules so it wins the cascade at equal specificity. The higher-
specificity `:disabled` rules still flatten it, so a disabled inverse button uses the shared
disabled treatment - matching how `tone` is flattened when disabled.

### Disabled

Two disabled treatments, matching each appearance's own resting border visibility rather than one
shared look applied uniformly:

- **`appearance="default"`** already shows a visible border at rest - disabled keeps a border,
  using `color-border-disabled`.
- **`appearance="primary"` and `appearance="subtle"`** (any tone) are borderless at rest - applying
  `color-border-disabled` there would draw a border that was never part of their resting look, so
  disabled stays borderless (`border-color: transparent`) instead.

Background (`color-background-disabled`) and content (`color-content-disabled`) are shared by both
treatments - only the border differs.

## Accessibility

Button must:

- render a native `button`
- default to `type="button"`
- support `type="submit"` and `type="reset"`
- support keyboard activation through native behavior
- expose visible focus using Focus Ring utility classes
- support disabled behavior with native `disabled`
- not use ARIA roles to recreate button semantics
- communicate loading state accessibly

Recommended loading accessibility:

- apply `aria-busy="true"` when loading
- disable activation while loading
- keep the action label visible

## Focus Ring

Button must consume the shared Focus Ring primitive/utilities.

Do not create a separate custom focus ring implementation.

Use `:focus-visible` behavior through the shared utility classes.

## Storybook

Use atom documentation structure:

```txt
Button
├─ Playground
├─ Variants
└─ Examples
```

### Playground

Controls for:

- size
- appearance
- tone
- isInverse
- disabled
- isLoading
- isFullWidth
- iconBefore
- iconAfter
- children

### Variants

Show:

- sizes
- appearances
- tones
- inverse (on a dark surface)
- disabled
- loading
- icon before
- icon after
- full width

### Examples

Show:

- primary action
- secondary action
- subtle action
- warning action
- error/destructive action
- loading submit button
- button row
- form footer

Do not create one story per variant permutation unless necessary.

## Testing

Use Vitest and React Testing Library.

Test:

- renders children
- defaults to `type="button"`
- supports custom `type`
- supports size variants
- supports appearance variants
- supports tone variants
- supports the inverse treatment (isInverse)
- disabled behavior
- loading behavior
- loading preserves label/content
- full width class
- iconBefore rendering
- iconAfter rendering
- custom className
- native button props
- onClick behavior
- onClick suppressed when disabled/loading
- focus ring class integration

## Engineering Requirements

- React
- TypeScript
- CSS Modules
- CSS variables
- no MUI
- no Tailwind
- no hardcoded colors
- no hardcoded spacing when tokens exist
- no hardcoded typography
- export from `index.ts`

## Future Components

Button should be built to allow future adjacent components without breaking changes:

- IconButton (built)
- ToggleButton (built)
- SplitButton (built)
- ButtonGroup (built)

Do not implement these in the base Button.
