# Toggle Button Component Checklist

## Component name

Toggle Button

## Description

Allows users to switch between selected and unselected states while visible as a button.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Button
- Icon Button
- Toggle Icon Button, future component
- Toggle Button Group, future component

## Purpose

Use Toggle Button when a button needs to represent a persistent selected/unselected state.

Toggle Button should look like a button, but semantically behave like a pressed/unpressed toggle control.

## Do not confuse with Switch

Toggle Button is not Switch.

- Switch changes a setting on or off.
- Toggle Button represents whether a button-style option is selected.

## Anatomy

Toggle Button contains:

1. Root button element
2. Optional leading icon
3. Text label
4. Optional trailing icon
5. Focus Ring
6. Selected-state styling

## Figma properties

```txt
size: lg | md | xs | sm
tone: default | subtle
state: default | hover | press | focus
isSelected: false | true
isDisabled: false | true
iconBefore: false | true
iconAfter: false | true
buttonText: string
```

## Code props

```ts
type ToggleButtonTone = 'default' | 'subtle';
type ToggleButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ToggleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: ToggleButtonSize;
  tone?: ToggleButtonTone;
  isSelected?: boolean;
  isDisabled?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
```

## Defaults

```txt
size: md
tone: default
isSelected: false
isDisabled: false
type: button
```

## Required accessibility

Toggle Button must render a native button.

Use:

```tsx
aria-pressed={isSelected}
```

Do not use:

```txt
aria-selected
aria-expanded
role="switch"
role="checkbox"
```

## Controlled behavior

Toggle Button should be controlled by the parent.

It should not manage internal selected state in this initial implementation.

Example:

```tsx
<ToggleButton isSelected={isBold} onClick={toggleBold}>
  Bold
</ToggleButton>
```

## Supported tones

```txt
default
subtle
```

Do not add warning, error, discovery, or primary tones in this pass.

## Supported sizes

```txt
xs
sm
md
lg
```

Use Button sizing.

## Supported states

```txt
default
hover
press
focus
selected
selected + hover
selected + press
selected + focus
disabled
selected + disabled
```

## Selected styling

Selected state should use selected semantic tokens:

```txt
background: color/background/selected/default
content: color/content/selected
border: color/border/selected
```

Use actual generated token names in code.

## Disabled behavior

When disabled:

- Use native `disabled`.
- Suppress hover/press styles.
- Suppress click behavior.
- Use disabled semantic color tokens.

Disabled should win over interaction states.

## Focus behavior

Use the shared Focus Ring utility/classes.

Focus should match Button.

Do not create a custom one-off focus implementation.

## Icon behavior

Support:

```txt
iconBefore
iconAfter
```

Use Button icon behavior:

- md icon size
- same gap
- same color inheritance
- same disabled behavior

Do not expose icon size as a public prop.

## Loading behavior

Do not include loading for Toggle Button in this pass.

## Expanded behavior

Do not include expanded behavior.

## Group behavior

Do not build ToggleButtonGroup in this pass.

## Storybook requirements

Use the current simplified story structure:

- Playground
- Variants
- Examples

Do not create separate States or Accessibility pages.

Show:

- all sizes
- both tones
- selected and unselected
- disabled
- selected + disabled
- icon before
- icon after
- toolbar example
- view-mode example

## Test requirements

Test:

- renders native button
- defaults type to button
- renders children
- supports iconBefore
- supports iconAfter
- sets `aria-pressed="false"` by default
- sets `aria-pressed="true"` when selected
- applies selected class/state when selected
- applies size classes
- applies tone classes
- disabled sets native disabled
- disabled prevents click
- supports custom `className`
- forwards ref

## Do not include

Do not use MUI.

Do not use Tailwind.

Do not render an anchor.

Do not use `aria-selected`.

Do not use `aria-expanded`.

Do not use `role="switch"`.

Do not add loading.

Do not add `asChild`.

Do not add ToggleButtonGroup.

Do not add Toggle Icon Button.
