# Toggle Icon Button Component Checklist

## Component name

Toggle Icon Button

## Description

An icon-only toggle button lets users switch between selected and unselected states where space is limited.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Button
- Icon Button
- Toggle Button
- Tooltip
- Toggle Icon Button Group, future component

## Purpose

Use Toggle Icon Button when a compact icon-only control needs to represent a persistent selected/unselected state.

Use Icon Button for momentary icon-only actions.
Use Toggle Button when the action benefits from visible text.
Use Switch for settings that turn something on or off.

## Anatomy

Toggle Icon Button contains:

1. Root button element
2. Icon slot using `children`
3. Focus Ring
4. Selected/unselected visual state
5. Accessible name through `aria-label` or `aria-labelledby`

## Figma properties

```txt
shape: round | square
size: xs | sm | md | lg
tone: default | subtle
state: default | hover | press | focus
isSelected: false | true
isDisabled: false | true
```

## Code props

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

## Required accessibility

Toggle Icon Button must have an accessible name.

Acceptable:

```tsx
<ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

```tsx
<ToggleIconButton aria-labelledby="grid-view-label" isSelected={isGridView}>
  <GridIcon />
</ToggleIconButton>
```

Not acceptable:

```tsx
<ToggleIconButton isSelected>
  <GridIcon />
</ToggleIconButton>
```

Tooltip text must not be the only accessible name.

## ARIA behavior

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

## Tooltip guidance

Toggle Icon Button should not render Tooltip internally.

Tooltip may wrap Toggle Icon Button:

```tsx
<Tooltip content="Grid view">
  <ToggleIconButton aria-label="Grid view" isSelected={isGridView}>
    <GridIcon />
  </ToggleIconButton>
</Tooltip>
```

Tooltip content should usually match or clarify the accessible label.

## Size requirements

Toggle Icon Button uses the same square size scale as Icon Button.

```txt
xs: 24px square
sm: 32px square
md: 40px square
lg: 48px square
```

Icon size is always `md`.

Do not scale the icon by button size unless future design direction changes.

## Shape requirements

```txt
square: size-specific Button/Icon Button radius
round: full-round radius
```

Default shape is `square`.

## Tone requirements

Supported tones:

```txt
default
subtle
```

Do not add warning, error, discovery, or primary for the initial pass.

## State requirements

Support:

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

## Selected behavior

When `isSelected` is true:

- Set `aria-pressed="true"`.
- Apply selected visual styling.
- Preserve button dimensions.
- Keep icon centered.

Recommended selected tokens:

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
- Maintain accessible disabled semantics.

Disabled should win over selected for interaction.

## Focus behavior

Use the shared Focus Ring primitive or utility classes.

Focus Ring should match Icon Button and Toggle Button behavior.

Do not create a custom one-off focus style.

## Keyboard behavior

Native button behavior:

```txt
Enter: activates
Space: activates
Tab: focuses
```

## Token usage

Use semantic tokens where available.

Use component tokens for anatomy only if Button/Icon Button tokens cannot be reused cleanly.

Do not hardcode:

- sizes
- colors
- spacing
- border widths
- radius values
- focus ring values

## Storybook requirements

Stories should include:

- Playground
- Variants
- Examples

Do not create separate States or Accessibility pages.

Show:

- all sizes
- all tones
- square and round shape
- selected and unselected
- disabled
- tooltip wrapper example if Tooltip exists
- toolbar/view-mode examples

## Test requirements

Test:

- renders a native button
- defaults to `type="button"`
- requires/supports accessible name
- supports `aria-label`
- supports `aria-labelledby`
- renders children as icon content
- sets `aria-pressed="false"` by default
- sets `aria-pressed="true"` when selected
- applies selected state/class
- disabled uses native disabled behavior
- click handler fires when enabled
- click handler does not fire when disabled
- applies size classes
- applies tone classes
- applies shape classes
- supports custom `className`
- forwards ref

## Do not include

Do not include Tooltip internally.

Do not include `asChild`.

Do not include link behavior.

Do not include loading for the initial pass.

Do not include expanded/menu-trigger behavior.

Do not expose icon size as a public prop.

Do not build ToggleIconButtonGroup yet.
