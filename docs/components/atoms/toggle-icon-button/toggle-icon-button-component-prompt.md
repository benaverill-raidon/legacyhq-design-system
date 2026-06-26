# Toggle Icon Button Component Prompt

## Component

Toggle Icon Button

## Description

An icon-only toggle button lets users switch between selected and unselected states where space is limited.

## Implementation summary

Build Toggle Icon Button as a Button-family atom.

It should look like Icon Button but behave semantically like Toggle Button.

Use Icon Button sizing, shape, icon-only layout, focus, and accessible-name requirements.

Use Toggle Button selected/unselected behavior with `aria-pressed`.

## Core API

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

## Defaults

```txt
size: md
tone: default
shape: square
isSelected: false
isDisabled: false
type: button
```

## Required root

Render a native button.

Do not render an anchor.

Do not use role switch.

Do not use aria-selected.

Do not use aria-expanded.

## Accessibility

Toggle Icon Button must have an accessible name.

Support:

```tsx
<ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

and:

```tsx
<ToggleIconButton aria-labelledby="grid-view-label" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

Set:

```tsx
aria-pressed={isSelected}
```

Use native disabled:

```tsx
disabled={isDisabled}
```

Default button type should be `button` unless the user explicitly passes another type.

Tooltip text must not be the only accessible name.

## Tooltip guidance

Do not render Tooltip internally.

Toggle Icon Button should be compatible with external Tooltip usage:

```tsx
<Tooltip content="Grid view">
  <ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
    <GridIcon />
  </ToggleIconButton>
</Tooltip>
```

## Selected state

`isSelected` controls the selected/pressed visual state.

This should be controlled by the parent.

Do not add internal uncontrolled selected state.

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

Expected selected styling:

```txt
background: var(--color-background-selected-default)
content: var(--color-content-selected)
border: var(--color-border-selected)
```

Use actual generated token names.

Do not hardcode colors.

## Tone

Support:

```txt
default
subtle
```

Do not add warning, error, discovery, or primary for this pass.

## Size

Support:

```txt
xs
sm
md
lg
```

Expected dimensions should match Icon Button:

```txt
xs: 24px × 24px
sm: 32px × 32px
md: 40px × 40px
lg: 48px × 48px
```

Use tokenized values only.

## Shape

Support:

```txt
square
round
```

Default shape:

```txt
square
```

Shape behavior should match Icon Button:

```txt
square: size-specific Button/Icon Button radius
round: full-round radius
```

## Icon

Use `children` for the icon.

```tsx
<ToggleIconButton aria-label="Grid view" isSelected>
  <GridIcon />
</ToggleIconButton>
```

Do not add an `icon` prop.

Icon size should match Icon Button behavior:

```txt
all sizes use md icon size
```

Do not expose an icon size prop.

## Focus

Use shared Focus Ring utility/classes.

Focus should match Icon Button and Toggle Button.

Do not create a custom one-off focus style.

## Disabled

Use native disabled behavior.

When disabled:

```txt
disabled attribute is present
click is suppressed by native behavior
hover/press styles are suppressed
disabled tokens are used
```

## Loading

Do not add loading for Toggle Icon Button in this pass.

Do not add Spinner.

## Expanded

Do not add expanded behavior.

This is not a menu trigger component.

Use Icon Button separately for menu trigger/disclosure use cases.

## Files

Create:

```txt
packages/ui/src/components/atoms/toggle-icon-button/
```

Expected files:

```txt
ToggleIconButton.tsx
ToggleIconButton.types.ts
ToggleIconButton.module.css
ToggleIconButton.test.tsx
ToggleIconButton.stories.tsx
index.ts
toggle-icon-button-component-checklist.md
toggle-icon-button-component-spec.md
toggle-icon-button-component-prompt.md
```

Use actual project naming conventions.

## Exports

Add Toggle Icon Button to atom/component barrel exports.

## Storybook

Create:

```txt
Toggle Icon Button / Playground
Toggle Icon Button / Variants
Toggle Icon Button / Examples
```

Do not create separate States or Accessibility pages.

## Testing

Test:

- native button rendering
- default `type="button"`
- ref forwarding
- `children` icon rendering
- accessible name support
- `aria-pressed` false by default
- `aria-pressed` true when selected
- disabled behavior
- selected styling/state
- size class
- tone class
- shape class
- custom className
- click behavior

## Do not

Do not use MUI.

Do not use Tailwind.

Do not hardcode design values.

Do not render an anchor.

Do not use aria-selected.

Do not use aria-expanded.

Do not use role switch.

Do not add loading.

Do not add asChild.

Do not add ToggleIconButtonGroup.

Do not make unrelated component changes.
