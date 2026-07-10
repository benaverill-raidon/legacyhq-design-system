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

export type ButtonTone = 'neutral' | 'warning' | 'error' | 'discovery';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  tone?: ButtonTone;
  isDisabled?: boolean;
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
type = 'button'
isDisabled = false
isLoading = false
isFullWidth = false
```

## Variants

### Size

| Size | Min height | Horizontal padding | Radius | Border width |
|---|---:|---|---|---|
| xs | 24px | `spacing-100` | `border-radius-sm` | `border-width-default` |
| sm | 32px | `spacing-100` | `border-radius-sm` | `border-width-default` |
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

#### Discovery

Used for discovery, education, or guidance-oriented actions.

## Appearance and Tone Matrix

| Appearance | Neutral | Warning | Error | Discovery |
|---|---|---|---|---|
| default | standard neutral | warning outline/default | error outline/default | discovery outline/default |
| primary | primary brand | warning bold | error bold | discovery bold |
| subtle | neutral subtle | warning subtle | error subtle | discovery subtle |

## States

- default
- hover
- pressed
- focus
- disabled
- loading

Selected/toggled behavior is intentionally excluded from Button and should be handled by a future ToggleButton component.

## Behavior

### Native Button

Button must render a native `<button>` element.

The default `type` must be `button` to avoid accidental form submission.

### Disabled

When `isDisabled` is true:

- pass the native `disabled` attribute
- prevent activation
- apply disabled visual treatment

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
--component-button-min-height-xs
--component-button-min-height-sm
--component-button-min-height-md
--component-button-min-height-lg
```

### Existing Tokens

Use existing semantic tokens for:

- padding-inline
- icon gap
- border radius
- border width
- typography
- color

### Size Token Mapping

```css
/* xs */
min-height: var(--component-button-min-height-xs);
padding-inline: var(--spacing-100);

/* sm */
min-height: var(--component-button-min-height-sm);
padding-inline: var(--spacing-100);

/* md */
min-height: var(--component-button-min-height-md);
padding-inline: var(--spacing-150);

/* lg */
min-height: var(--component-button-min-height-lg);
padding-inline: var(--spacing-200);
```

Common values:

```css
border-radius: var(--border-radius-sm);
border-width: var(--border-width-default);
gap: var(--spacing-075);
```

## Color Token Intent

Use available semantic color tokens from the theme CSS.

### Default + Neutral

- border: `color-border-default`
- content: `color-content-subtle` or existing text/content subtle token
- background: transparent or surface/input token based on Figma

### Primary + Neutral

- background: `color-background-brand-bold-default`
- hover: `color-background-brand-bold-hovered`
- pressed: `color-background-brand-bold-pressed`
- content/icon: `color-content-inverse`

### Primary + Warning

- background: `color-background-warning-bold-default`
- hover: `color-background-warning-bold-hovered`
- pressed: `color-background-warning-bold-pressed`
- content/icon: `color-content-warning-inverse` where available, otherwise inverse token defined by theme

### Primary + Error

- background: `color-background-error-bold-default`
- hover: `color-background-error-bold-hovered`
- pressed: `color-background-error-bold-pressed`
- content/icon: `color-content-inverse`

### Primary + Discovery

- background: `color-background-discovery-bold-default`
- hover: `color-background-discovery-bold-hovered`
- pressed: `color-background-discovery-bold-pressed`
- content/icon: `color-content-inverse`

### Subtle

Use neutral or semantic subtle background tokens for hover/pressed states, with default transparent/no-fill base where appropriate.

If an exact semantic token is missing, document it and use the closest existing approved token from the generated theme files.

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
- isDisabled
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
- discovery action
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

- IconButton
- ToggleButton
- SplitButton
- ButtonGroup

Do not implement these in the base Button.
