# Icon Button Component Spec

## Overview

Icon Button is an icon-only button used for common, recognizable actions where space is limited.

It belongs to the Button family and should reuse Button foundations wherever practical: sizing, appearance logic, focus behavior, disabled behavior, loading behavior, and token conventions.

## Description

An icon-only button lets people take a common and recognizable action where space is limited.

## When to use

Use Icon Button for compact actions such as:

- Edit
- Delete
- Close
- More options
- Open menu
- Search
- Add
- Remove
- Expand/collapse

Use Icon Button when the icon meaning is widely understood or supported by nearby context.

## When not to use

Do not use Icon Button when:

- The action is primary and needs clear text.
- The icon meaning is ambiguous.
- The action is destructive and needs confirmation or clearer labeling.
- There is enough space for a normal Button.
- The button is acting as a persistent selected/toggled control. Use Toggle Icon Button later.

## Anatomy

```txt
IconButton
├─ button root
│  ├─ icon slot / children
│  └─ spinner, loading only
└─ focus ring
```

## Public API

```ts
type IconButtonAppearance = 'default' | 'primary' | 'subtle';
type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type IconButtonShape = 'square' | 'round';

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  appearance?: IconButtonAppearance;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  isLoading?: boolean;
  isExpanded?: boolean;
  children: React.ReactNode;
}
```

## Default props

```ts
const defaultProps = {
  appearance: 'default',
  size: 'md',
  shape: 'square',
  isLoading: false,
  isExpanded: false,
  type: 'button',
};
```

## Children

Icon Button uses `children` for the icon.

```tsx
<IconButton aria-label="Edit">
  <EditIcon />
</IconButton>
```

Do not use a dedicated `icon` prop.

## Accessible name

Every Icon Button must have an accessible name.

Preferred:

```tsx
<IconButton aria-label="Edit">
  <EditIcon />
</IconButton>
```

Alternative:

```tsx
<span id="edit-button-label">Edit</span>

<IconButton aria-labelledby="edit-button-label">
  <EditIcon />
</IconButton>
```

Tooltip content is not a replacement for an accessible name.

## Tooltip usage

Tooltip should be external.

```tsx
<Tooltip content="Edit">
  <IconButton aria-label="Edit">
    <EditIcon />
  </IconButton>
</Tooltip>
```

Icon Button should be designed to work well inside Tooltip but should not import or render Tooltip internally.

## Size mapping

Icon Button uses Button sizing.

```txt
xs: 24px × 24px
sm: 32px × 32px
md: 40px × 40px
lg: 48px × 48px
```

The button is always square in layout, regardless of `shape`.

## Icon size

Icon size is always `md`.

This follows the Button rule that icons use the md icon size with no icon-specific spacing.

## Shape mapping

```txt
square: size-specific Button radius
round: border-radius-full-round
```

Default:

```txt
shape: square
```

## Appearance mapping

Supported:

```txt
default
primary
subtle
```

Use Button-family color logic.

Recommended mapping:

```txt
default:
background/input/default or neutral/default
border/default
content/subtle or content/default

primary:
background/brand/bold/default
background/brand/bold/hovered
background/brand/bold/pressed
content/inverse

subtle:
background transparent/default
background/neutral/subtle/hovered
background/neutral/subtle/pressed
content/default or content/subtle
```

Use actual existing token names in code.

## State behavior

### Default

Resting visual style.

### Hover

Shows hover background and/or border treatment.

Disabled Icon Button must not show hover state.

### Press

Shows pressed background and/or border treatment.

Disabled Icon Button must not show press state.

### Focus

Uses shared Focus Ring utility.

Focus should be visually consistent with Button.

### Disabled

Uses native `disabled`.

Suppresses click and hover/press styles.

### Loading

Replaces icon with Spinner.

Preserves fixed square dimensions.

Sets `aria-busy="true"`.

Recommended: disable interaction while loading.

### Expanded

Used for menu/disclosure trigger buttons.

When `isExpanded` is true:

```tsx
aria-expanded={true}
```

Do not use `aria-pressed` for expanded state.

Expanded visual style can reuse pressed/open styling.

## Menu trigger guidance

Use `isExpanded` when Icon Button opens a menu, popover, or disclosure.

Example:

```tsx
<IconButton
  aria-label="More actions"
  aria-haspopup="menu"
  aria-expanded={isOpen}
  isExpanded={isOpen}
>
  <MoreIcon />
</IconButton>
```

## Accessibility requirements

Icon Button must:

- Render a native `button`.
- Default to `type="button"`.
- Support `aria-label`.
- Support `aria-labelledby`.
- Support `aria-describedby`.
- Support `aria-expanded`.
- Support `aria-haspopup`.
- Support disabled.
- Preserve native keyboard behavior.
- Forward refs.

## Implementation requirements

Use CSS Modules.

Use existing Button patterns where practical.

Use existing Spinner component.

Use existing Focus Ring utility.

Use tokenized values only.

## Styling requirements

The root should:

- be inline-flex
- align-items center
- justify-content center
- fixed inline/block size by size prop
- use `border-box`
- use pointer cursor when enabled
- use not-allowed cursor when disabled
- have no text layout gap
- hide decorative icon from accessibility if needed through icon implementation

## Token strategy

Use semantic tokens for:

- colors
- spacing
- focus ring
- border widths
- radius
- disabled state

Use component tokens only for:

- icon button square size if Button min-height tokens cannot be reused
- loading spinner size if needed

Prefer reusing Button component tokens where available.

## Storybook

Create stories:

```txt
Icon Button / Playground
Icon Button / Variants
Icon Button / States
Icon Button / Examples
Icon Button / Accessibility
```

### Playground controls

```txt
appearance
size
shape
isDisabled
isLoading
isExpanded
aria-label
```

### Variants story

Show matrix:

```txt
appearance: default | primary | subtle
size: xs | sm | md | lg
shape: square | round
```

### States story

Show:

```txt
default
hover
press
focus
disabled
loading
expanded
```

### Examples story

Show:

- Tooltip-wrapped icon button
- Menu trigger icon button
- Loading icon button
- Disabled icon button
- Toolbar icon button row

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders native button
defaults type to button
forwards ref
renders children icon
supports aria-label
supports aria-labelledby
applies size classes
applies appearance classes
applies shape classes
disabled prevents click
loading renders spinner
loading sets aria-busy
expanded sets aria-expanded
custom className is applied
```

## Open decisions

None for initial implementation.

Future:

- Add warning/error/discovery appearances if needed.
- Add Toggle Icon Button separately.
- Add Link/Icon Link behavior separately if needed.
