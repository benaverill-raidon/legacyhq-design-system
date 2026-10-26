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
├─ leading icon
├─ content
├─ trailing icon
└─ spinner, over the content while loading
```

Loading holds the button's size: the spinner sits centered over the content, and the label and icons keep their space, hidden, so nothing shifts or reflows. The label stays the accessible name. The spinner is `md`, the size of Button's icons. This matches Figma's loading variant, which shows the spinner alone, while keeping the resting width.

## Public API

```ts
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProminence = 'primary' | 'secondary' | 'tertiary';

export type ButtonTone = 'default' | 'brand' | 'warning' | 'error';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  prominence?: ButtonProminence;
  tone?: ButtonTone;
  isInverse?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  isExpanded?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
```

## Default Props

```ts
size = 'md'
prominence = 'secondary'
tone = 'default'
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

### Prominence

#### Primary

A high-emphasis button for the primary action in a section, form, or workflow. Brand fill.

#### Secondary (default)

A standard button for secondary or neutral actions. Bordered, with no fill.

#### Tertiary

A low-emphasis button for inline or lower-priority actions. No border, no fill.

### Tone

#### Default

Default action tone.

#### Brand

The brand color at every prominence. At primary it matches the default look.

#### Warning

Used for actions that require caution.

#### Error

Used for destructive or high-risk actions.

## Prominence and Tone Matrix

| Prominence | Default | Brand | Warning | Error |
|---|---|---|---|---|
| primary | brand bold | brand bold | warning bold | error bold |
| secondary | neutral outline | brand outline | (secondary default) | error outline |
| tertiary | neutral, no border | brand text, no border | (tertiary default) | (tertiary default) |

Pairings in parentheses are valid props but render the prominence's default look.

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
- apply disabled visual treatment - bordered for `prominence="secondary"`, borderless for
  `prominence="primary"`/`prominence="tertiary"` (see Color Token Intent > Disabled below)

### Loading

When `isLoading` is true:

- render a Spinner centered over the content
- hide the label and icons with opacity, so they keep their space and the label stays the accessible name
- keep the button's width and height exactly
- prevent repeated activation

```txt
[  Save changes  ]   resting
[       ◌        ]   loading: same size, label still the accessible name
```

Button never changes size when loading starts or ends.

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

Respect `prefers-reduced-motion: reduce` by zeroing `transition-duration`. Do not hardcode a duration or easing curve directly on the component — consume the semantic motion token so retiming propagates system-wide. Button has no press-state scale or other transform motion: press feedback is color only.

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
gap: var(--spacing-075);
```

## Color Token Intent

Use available semantic color tokens from the theme CSS.

### Secondary + Default

- border: `color-border-input`
- content: `color-content-subtle`
- background: transparent
- hover / focus: `color-background-neutral-overlay-bold-hover`
- pressed: `color-background-neutral-overlay-bold-press`

### Primary + Default (and Primary + Brand)

- background: `color-background-brand-primary-bold-default`
- hover: `color-background-brand-primary-bold-hover`
- pressed: `color-background-brand-primary-bold-press`
- content/icon: `color-content-inverse-default`

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

### Secondary + Error (`prominence="secondary" tone="error"`)

The outlined destructive action - the lower-emphasis counterpart to Primary + Error, mirroring the
Secondary + Brand pattern with the error semantic tokens:

- border: `color-border-error` (rest, hover, focus, pressed)
- content/icon: `color-content-error`
- background: transparent at rest
- hover / focus: `color-background-error-overlay-hover`
- pressed: `color-background-error-overlay-press`
- disabled: the bordered secondary disabled treatment (`color-border-disabled`,
  `color-background-disabled`, `color-content-disabled`)
- `isInverse` overrides it at rest, hover, and press (the inverse rules carry an extra `.button`
  class so they out-rank the prominence x tone hover/press selectors)

Contrast (WCAG 2.x, 14px/600 label needs 4.5:1; border needs 3:1 as a non-text UI boundary):
light (`red-800` #a5140f) is 7.38:1 on `elevation-surface-default`, 5.66:1 on `surface-deep`, and
4.96:1 on surface-default under the hover overlay. Dark (`red-500` #ff3b34) is 4.47:1 on
`elevation-surface-default` (#242221) and 3.97:1 on `surface-raised` (#2e2b28) - the border passes,
but the label falls just short of 4.5:1 in dark mode. This is a known gap in the shared
`color-content-error` dark value, not in Button. Raising it to `red-400` was tried and reverted so
code stays in line with Figma's Tokens v1.0.0 file; resolve it there first, then re-export.

Supported prominence x tone pairings: primary (default, brand, warning, error); secondary (default,
brand, error); tertiary (default, brand). Warning is primary only. Other pairings render the
prominence's default look.

### Tertiary

- border and background: transparent at rest
- content: `color-content-subtle` (`color-content-brand-primary-default` with `tone="brand"`)
- hover / focus: `color-background-neutral-overlay-bold-hover`
  (`color-background-brand-primary-overlay-hover` with `tone="brand"`)
- pressed: `color-background-neutral-overlay-bold-press`
  (`color-background-brand-primary-overlay-press` with `tone="brand"`)

If an exact semantic token is missing, document it and use the closest existing approved token from the generated theme files.

### Inverse (`isInverse`)

An orthogonal on-dark treatment for buttons placed on dark or bold-colored surfaces (e.g. Banner).
It is a boolean prop, not part of the `tone` axis, so it can later compose with any `prominence`
(the outlined `secondary` inverse treatment is planned). It overrides the resting prominence fill:

- background: transparent
- border: transparent
- content/icon: `color-content-inverse`
- hover: `color-background-neutral-overlay-subtle-hover` (white subtle, the mode-flipped mirror of the
  dark `color-background-neutral-overlay-bold-hover`)
- pressed: `color-background-neutral-overlay-subtle-press`
- focus: white subtle hover fill plus the shared focus ring

Declared after the prominence rules so it wins the cascade at equal specificity. The higher-
specificity `:disabled` rules still flatten it, so a disabled inverse button uses the shared
disabled treatment - matching how `tone` is flattened when disabled.

### Disabled

Two disabled treatments, matching each prominence's own resting border visibility rather than one
shared look applied uniformly:

- **`prominence="secondary"`** already shows a visible border at rest - disabled keeps a border,
  using `color-border-disabled`.
- **`prominence="primary"` and `prominence="tertiary"`** (any tone) are borderless at rest - applying
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

- apply `aria-busy="true"` and `aria-disabled="true"` when loading, keeping the button focusable
  (not natively `disabled`) so focus doesn't jump while the action runs
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
- prominence
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
- prominences
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
- tertiary action
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
- supports prominence variants
- supports tone variants
- supports the inverse treatment (isInverse)
- disabled behavior
- loading behavior
- loading holds the button's size
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
