# Toggle Icon Button Component Spec

## Overview

Toggle Icon Button is an icon-only Button-family atom that represents a persistent selected/unselected state.

It combines Icon Button layout with Toggle Button semantics.

## Description

An icon-only toggle button lets users switch between selected and unselected states where space is limited.

## When to use

Use Toggle Icon Button for compact selected/unselected controls such as:

- View mode selection
- Favorite/saved state
- Pinned/unpinned state
- Formatting toolbar controls
- Compact filter state
- Icon-only preference toggles inside dense toolbars

## When not to use

Do not use Toggle Icon Button when:

- The control triggers a one-time action. Use Icon Button.
- The action benefits from visible text. Use Toggle Button.
- The control turns a setting on/off. Use Switch.
- The control opens a menu or popover. Use Icon Button with `isExpanded` if available.
- The control navigates somewhere. Use Link Button or Link.

## Core principle

Visual style follows Icon Button.

State semantics follow Toggle Button.

Use:

```tsx
aria-pressed={isSelected}
```

Do not use:

```txt
aria-selected
aria-expanded
role="switch"
```

## Anatomy

```txt
ToggleIconButton
├─ button root
│  └─ icon slot / children
└─ focus ring
```

## Public API

```ts
type ToggleIconButtonTone = 'default' | 'subtle';
type ToggleIconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type ToggleIconButtonShape = 'square' | 'round';

interface ToggleIconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: ToggleIconButtonSize;
  tone?: ToggleIconButtonTone;
  shape?: ToggleIconButtonShape;
  isSelected?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}
```

## Default props

```ts
const defaultProps = {
  size: 'md',
  tone: 'default',
  shape: 'square',
  isSelected: false,
  isDisabled: false,
  type: 'button',
};
```

## Children

Toggle Icon Button uses `children` for the icon.

```tsx
<ToggleIconButton aria-label="Grid view" isSelected>
  <GridIcon />
</ToggleIconButton>
```

Do not use a dedicated `icon` prop.

## Accessible name

Every Toggle Icon Button must have an accessible name.

Preferred:

```tsx
<ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

Alternative:

```tsx
<span id="grid-view-label">Grid view</span>

<ToggleIconButton aria-labelledby="grid-view-label" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

Tooltip content is not a replacement for an accessible name.

## Tooltip usage

Tooltip should be external.

```tsx
<Tooltip content="Grid view">
  <ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
    <GridIcon />
  </ToggleIconButton>
</Tooltip>
```

Toggle Icon Button should be designed to work well inside Tooltip but should not import or render Tooltip internally.

## Size mapping

Toggle Icon Button uses Icon Button sizing.

```txt
xs: 24px × 24px
sm: 32px × 32px
md: 40px × 40px
lg: 48px × 48px
```

The button is always square in layout, regardless of `shape`.

## Icon size

Icon size is always `md`.

This follows the Icon Button rule that icons use the md icon size across all button sizes.

## Shape mapping

```txt
square: size-specific Button/Icon Button radius
round: border-radius-full-round
```

Default:

```txt
shape: square
```

## Tone mapping

Supported:

```txt
default
subtle
```

Use Toggle Button tone styling where possible.

Do not add warning, error, discovery, or primary in the initial pass.

## Selected state

`isSelected` controls the selected/pressed visual state.

This should be controlled by the parent. Do not add internal uncontrolled selected state.

When selected:

```txt
aria-pressed=true
selected visual styling is applied
```

When unselected:

```txt
aria-pressed=false
default visual styling is applied
```

## Selected token mapping

Use selected semantic tokens.

Recommended selected styling:

```txt
background: var(--color-background-selected-default)
content: var(--color-content-selected)
border: var(--color-border-selected)
```

Use actual generated token names in code.

Selected should remain clear in default, hover, press, and focus states.

## Disabled selected behavior

Support selected + disabled.

Disabled should win for interaction. If the design system has selected-disabled tokens, use them. Otherwise disabled styling may fully override selected visuals.

Recommended priority:

```txt
disabled > selected > press > hover > default
```

## Focus behavior

Use the shared Focus Ring utility/classes.

Focus should match Icon Button and Toggle Button.

## Accessibility requirements

Toggle Icon Button must:

- Render a native `button`.
- Default to `type="button"`.
- Support `aria-label`.
- Support `aria-labelledby`.
- Support `aria-describedby`.
- Set `aria-pressed` from `isSelected`.
- Support disabled.
- Preserve native keyboard behavior.
- Forward refs.

## Implementation requirements

Use CSS Modules.

Use existing Icon Button and Toggle Button patterns where practical.

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
- use Icon Button square/round shape behavior
- use Toggle Button selected state behavior

## Token strategy

Use semantic tokens for:

- colors
- spacing
- focus ring
- border widths
- radius
- disabled state
- selected state

Use component tokens only for anatomy if needed.

Prefer reusing Icon Button and Toggle Button component tokens/classes where available.

## Storybook

Create:

```txt
Toggle Icon Button / Playground
Toggle Icon Button / Variants
Toggle Icon Button / Examples
```

Do not create separate States or Accessibility pages.

### Playground controls

```txt
size
tone
shape
isSelected
isDisabled
aria-label
```

### Variants story

Show matrix:

```txt
tone: default | subtle
size: xs | sm | md | lg
shape: square | round
selected: false | true
disabled: false | true
```

### Examples story

Show:

- view mode toggle
- formatting toolbar icon
- favorite/save toggle
- selected and unselected pair
- Tooltip-wrapped toggle icon button if Tooltip exists

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
sets aria-pressed=false by default
sets aria-pressed=true when isSelected=true
applies selected class/state when selected
applies size classes
applies tone classes
applies shape classes
disabled sets native disabled
disabled prevents click
custom className is applied
```

## Future considerations

Future components:

- ToggleIconButtonGroup
- Segmented control
- Toolbar patterns

Do not implement these now.
