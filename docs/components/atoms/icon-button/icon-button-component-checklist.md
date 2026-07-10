# Icon Button Component Checklist

## Component name

Icon Button

## Description

An icon-only button lets people take a common and recognizable action where space is limited.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Button
- Spinner
- Tooltip
- Menu / Dropdown trigger
- Toggle Icon Button, future component

## Purpose

Use Icon Button when the action is recognizable from an icon and available space is limited.

Icon Button should not replace normal Button when the action benefits from visible text. Prefer Button with a label for primary actions, destructive actions, or actions that may be ambiguous.

## Anatomy

Icon Button contains:

1. Root button element
2. Icon slot using `children`
3. Optional Spinner replacement when loading
4. Focus Ring
5. Accessible name through `aria-label` or `aria-labelledby`

## Figma properties

```txt
shape: round | square
size: xs | sm | md | lg
appearance: default | primary | subtle
state: default | hover | press | focus
isDisabled: false | true
isLoading: false | true
isExpanded: false | true
```

## Code props

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

## Defaults

```txt
appearance: default
size: md
shape: square
isLoading: false
isExpanded: false
type: button
```

## Required accessibility

Icon Button must have an accessible name.

Acceptable:

```tsx
<IconButton aria-label="Edit">
  <EditIcon />
</IconButton>
```

```tsx
<IconButton aria-labelledby="edit-label">
  <EditIcon />
</IconButton>
```

Not acceptable:

```tsx
<IconButton>
  <EditIcon />
</IconButton>
```

Tooltip text must not be the only accessible name.

## Tooltip guidance

Icon Button should not render Tooltip internally.

Tooltip may wrap Icon Button:

```tsx
<Tooltip content="Edit">
  <IconButton aria-label="Edit">
    <EditIcon />
  </IconButton>
</Tooltip>
```

Tooltip content should usually match or clarify the accessible label.

## Size requirements

Icon Button uses the same size scale as Button.

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
square: uses size-specific Button radius
round: uses full-round radius
```

Default shape is `square`.

## Appearance requirements

Supported appearances:

```txt
default
primary
subtle
```

Use the current Button color logic as the foundation where possible.

## State requirements

Support:

```txt
default
hover
press
focus
disabled
loading
expanded
```

## Loading behavior

When `isLoading` is true:

- Replace icon content with Spinner.
- Preserve button width and height.
- Set `aria-busy="true"`.
- Disable interaction unless the existing Button pattern says otherwise.
- Spinner should use the appropriate size for the Icon Button.
- Spinner should inherit or map to the correct color for the appearance.

## Expanded behavior

`isExpanded` supports menu-trigger and disclosure use cases.

When `isExpanded` is true:

- Set `aria-expanded={true}`.
- Visually represent the expanded/open state using the same style as pressed or selected, based on the existing Button/menu-trigger pattern.
- Do not introduce a Toggle Button behavior.
- Do not use `aria-pressed` for expanded state.

## Disabled behavior

When disabled:

- Use native `disabled`.
- Suppress hover/press styles.
- Suppress click behavior.
- Use disabled semantic color tokens.
- Maintain accessible disabled semantics.

## Focus behavior

Use the shared Focus Ring primitive or utility classes.

Focus Ring should match Button behavior.

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

Use component tokens for Icon Button anatomy only if Button tokens cannot be reused cleanly.

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
- States
- Examples
- Accessibility

Show:

- all sizes
- all appearances
- square and round shape
- hover preview
- press preview
- focus preview
- disabled
- loading
- expanded
- Tooltip wrapper example
- menu trigger example

## Test requirements

Test:

- renders a native button
- defaults to `type="button"`
- requires accessible name warning or test coverage
- supports `aria-label`
- supports `aria-labelledby`
- renders children as icon content
- loading replaces icon with Spinner
- loading sets `aria-busy`
- disabled uses native disabled behavior
- expanded sets `aria-expanded`
- click handler fires when enabled
- click handler does not fire when disabled/loading if loading disables interaction
- applies size classes
- applies appearance classes
- applies shape classes
- supports custom `className`
- forwards ref

## Do not include

Do not include Tooltip internally.

Do not include `asChild`.

Do not include link behavior.

Do not include selected/toggle behavior.

Do not expose icon size as a public prop yet.

Do not add warning/error/discovery appearances yet.
