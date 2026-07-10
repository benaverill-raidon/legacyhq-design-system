# Toggle Button Component Prompt

## Component

Toggle Button

## Description

Allows users to switch between selected and unselected states while visible as a button.

## Implementation summary

Build Toggle Button as a Button-family atom.

It should share Button sizing, typography, icon behavior, radius, focus ring, disabled behavior, and token patterns where practical.

It should render a native button and use `aria-pressed` for selected state.

## Core API

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

## Required element

Render a native button.

Do not render an anchor.

Do not use role switch.

Do not use aria-selected.

## Accessibility

Set:

```tsx
aria-pressed={isSelected}
```

Use native disabled:

```tsx
disabled={isDisabled}
```

Default `type` should be `button` unless a type is explicitly provided.

## Selected behavior

`isSelected` controls the selected state.

Treat Toggle Button as controlled by the parent.

Do not add internal selected state.

## Selected styling

Use selected semantic tokens:

```txt
background: color/background/selected/default
content: color/content/selected
border: color/border/selected
```

Use actual generated token names.

## Tone support

Support only:

```txt
default
subtle
```

Do not add warning, error, discovery, or primary in this pass.

## Size support

Support:

```txt
xs
sm
md
lg
```

Use Button size tokens/classes.

## Icons

Support:

```tsx
iconBefore
iconAfter
```

Use Button icon behavior:

```txt
md icon size
same icon gap
same icon color inheritance
same disabled behavior
```

Do not expose icon size prop.

## Focus

Use shared Focus Ring utility/classes.

Focus should match Button.

## Disabled

Use native disabled behavior.

Disabled suppresses click, hover, and press styles.

## Loading

Do not add loading in this pass.

## Expanded

Do not add expanded behavior.

## Files

Create component files under:

```txt
packages/ui/src/components/atoms/toggle-button/
```

Expected files may include:

```txt
ToggleButton.tsx
ToggleButton.types.ts
ToggleButton.module.css
ToggleButton.test.tsx
ToggleButton.stories.tsx
index.ts
toggle-button-checklist.md
toggle-button-spec.md
toggle-button-prompt.md
```

Use actual project naming conventions.

## Exports

Add Toggle Button to atom/component barrel exports.

## Storybook

Create:

```txt
Toggle Button / Playground
Toggle Button / Variants
Toggle Button / Examples
```

Do not create separate States or Accessibility pages.

## Testing

Test:

- native button rendering
- default `type="button"`
- children rendering
- iconBefore
- iconAfter
- aria-pressed false by default
- aria-pressed true when selected
- selected class/state
- size class
- tone class
- disabled behavior
- ref forwarding
- custom className
- click behavior

## Do not

Do not use MUI.

Do not use Tailwind.

Do not hardcode design values.

Do not render an anchor.

Do not use `aria-selected`.

Do not use `aria-expanded`.

Do not use `role="switch"`.

Do not add loading.

Do not add `asChild`.

Do not add ToggleButtonGroup.

Do not add Toggle Icon Button.

