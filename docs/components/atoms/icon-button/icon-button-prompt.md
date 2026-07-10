# Icon Button Component Prompt

## Component

Icon Button

## Description

An icon-only button lets people take a common and recognizable action where space is limited.

## Implementation summary

Build Icon Button as a Button-family atom.

It should share the same sizing foundation as Button and support:

```txt
appearance: default | primary | subtle
size: xs | sm | md | lg
shape: square | round
state: default | hover | press | focus
isDisabled
isLoading
isExpanded
```

Use `children` for the icon.

Do not include Tooltip internally.

Do not include toggle behavior.

Do not include link behavior.

## Core API

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

## Accessibility

Icon Button must require an accessible name in usage.

Support:

```tsx
<IconButton aria-label="Edit">
  <EditIcon />
</IconButton>
```

and:

```tsx
<IconButton aria-labelledby="edit-label">
  <EditIcon />
</IconButton>
```

Do not rely on Tooltip as the accessible name.

If possible, add a development warning when neither `aria-label` nor `aria-labelledby` is present.

## Tooltip guidance

Do not render Tooltip inside Icon Button.

Icon Button should be compatible with external Tooltip usage:

```tsx
<Tooltip content="Edit">
  <IconButton aria-label="Edit">
    <EditIcon />
  </IconButton>
</Tooltip>
```

## Loading

When `isLoading` is true:

- replace icon with Spinner
- preserve button dimensions
- set `aria-busy="true"`
- disable interaction unless existing Button behavior says otherwise
- use Spinner size/color appropriate to the Icon Button appearance

## Expanded

When `isExpanded` is true:

- set `aria-expanded={true}`
- use visual open/expanded styling
- do not use `aria-pressed`

This supports menu trigger use cases.

## Size

Use Button sizing.

```txt
xs: 24px
sm: 32px
md: 40px
lg: 48px
```

Icon size is always md.

## Shape

```txt
square: size-specific Button radius
round: full-round radius
```

Default shape is square.

## Appearance

Support:

```txt
default
primary
subtle
```

Keep narrower than Button for now. Do not add warning/error/discovery appearances yet.

## Focus

Use shared Focus Ring utility.

Match Button focus behavior.

## Disabled

Use native disabled behavior.

Disabled suppresses hover/press styles.

## File expectations

Create component files under:

```txt
packages/ui/src/components/atoms/icon-button/
```

Expected files may include:

```txt
IconButton.tsx
IconButton.types.ts
IconButton.module.css
IconButton.test.tsx
IconButton.stories.tsx
index.ts
icon-button-checklist.md
icon-button-spec.md
icon-button-prompt.md
```

Use actual project naming conventions if different.

## Export requirements

Export from component folder index.

Add to atom barrel exports and package exports wherever other atoms are exported.

## Storybook requirements

Create:

```txt
Icon Button / Playground
Icon Button / Variants
Icon Button / States
Icon Button / Examples
Icon Button / Accessibility
```

Include examples for:

- all sizes
- all appearances
- square and round
- disabled
- loading
- expanded/menu trigger
- tooltip wrapper
- toolbar row

## Testing requirements

Test:

- native button rendering
- default `type="button"`
- ref forwarding
- `children` icon rendering
- accessible name support
- disabled behavior
- loading behavior
- expanded behavior
- size class
- appearance class
- shape class
- custom className
- click behavior

## Do not

Do not use MUI.

Do not use Tailwind.

Do not hardcode design values.

Do not add Tooltip internally.

Do not add `asChild`.

Do not add link behavior.

Do not add toggle/selected behavior.

Do not expose icon size prop yet.

