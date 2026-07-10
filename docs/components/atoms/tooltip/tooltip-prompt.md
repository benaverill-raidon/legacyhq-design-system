# Tooltip Component Prompt

## Component

Tooltip

## Description

A tooltip is a floating, non-actionable label used to explain a user interface element or feature.

## Implementation summary

Build Tooltip as an atom that wraps a single trigger child and renders a short floating label on hover or focus.

In Figma, Tooltip uses a Slot plus a tooltip primitive. In code, implement this as a wrapper component with an internal visual content primitive.

Recommended code model:

```txt
Tooltip
├─ trigger child
└─ TooltipContent, internal visual primitive
```

Do not expose TooltipContent publicly in the first pass unless the project has a pattern for exported primitives.

## Recommended API

```ts
type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  truncate?: boolean;
  disabled?: boolean;
  delay?: number;
  className?: string;
}
```

## Defaults

```txt
placement: top
truncate: true
disabled: false
delay: 300
```

## Usage

```tsx
<Tooltip content="Edit">
  <IconButton aria-label="Edit">
    <EditIcon />
  </IconButton>
</Tooltip>
```

## Accessibility

Tooltip content must use:

```tsx
role="tooltip"
```

The trigger should be associated with the tooltip using:

```tsx
aria-describedby={tooltipId}
```

Tooltip must show on keyboard focus and hover.

Tooltip must hide on blur, mouse leave, and Escape.

Tooltip content must be non-interactive.

Tooltip must not be the only accessible name for icon-only controls.

## Behavior

Support:

```txt
hover show
mouse leave hide
focus show
blur hide
Escape hide
disabled
placement
truncate
delay
```

## Placement

Support:

```txt
top
right
bottom
left
```

Default is `top`.

No collision detection or viewport flipping is required in the first pass.

## Visual mapping

Use Figma values through existing project tokens:

```txt
background: color/background/neutral/bold/default
content: color/content/inverse
typography: body-sm
radius: 4px
padding-x: spacing-075
padding-y: spacing-025
gap: spacing-050
wrapped max-width: 240px
truncated max-width: 420px
```

Use actual generated token names.

## Truncation

When `truncate=true`:

```txt
single line
text ellipsis
max width 420px
```

When `truncate=false`:

```txt
wrap text
word break when needed
max width 240px
```

## File expectations

Create files under:

```txt
packages/ui/src/components/atoms/tooltip/
```

Expected files:

```txt
Tooltip.tsx
Tooltip.types.ts
Tooltip.module.css
Tooltip.test.tsx
Tooltip.stories.tsx
index.ts
tooltip-checklist.md
tooltip-spec.md
tooltip-prompt.md
```

Use actual project naming conventions.

## Storybook

Create:

```txt
Tooltip / Playground
Tooltip / Variants
Tooltip / Examples
```

Do not create separate States or Accessibility pages.

## Tests

Test:

```txt
renders child trigger
tooltip hidden initially
shows on hover
hides on mouse leave
shows on focus
hides on blur
hides on Escape
role tooltip
aria-describedby association
disabled prevents display
placement classes/states
truncate classes/states
preserves child event handlers
```

## Do not

Do not use MUI.

Do not use Tailwind.

Do not install new positioning libraries.

Do not add collision detection in the first pass.

Do not add portal behavior unless the project already has a portal pattern.

Do not make content interactive.

Do not use Tooltip as the accessible name for icon-only controls.

