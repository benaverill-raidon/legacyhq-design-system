# Tooltip Component Checklist

## Component name

Tooltip

## Description

A tooltip is a floating, non-actionable label used to explain a user interface element or feature.

## Status

Ready for implementation.

## Component category

Atom

## Related components

- Icon Button
- Button
- Link
- Toggle Icon Button
- Form controls

## Purpose

Use Tooltip to provide short, supplemental clarification for a nearby control or interface element.

Tooltip should not contain essential information. Tooltips have low discoverability and can have usability issues on devices without hover interactions.

## Anatomy

Tooltip contains:

1. Trigger child
2. Tooltip content layer
3. Internal visual primitive for the floating label

Recommended code structure:

```txt
Tooltip
├─ trigger child
└─ TooltipContent, internal visual primitive
```

## Figma structure

In Figma, Tooltip uses:

```txt
Tooltip component
├─ Slot {children}
└─ Tooltip primitive
```

In code, this should be implemented as a wrapper component that owns the trigger behavior and renders the tooltip content.

## Figma primitive properties

```txt
truncate: false | true
content: string
```

## Recommended code props

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

## Usage example

```tsx
<Tooltip content="Edit">
  <IconButton aria-label="Edit">
    <EditIcon />
  </IconButton>
</Tooltip>
```

## Accessibility requirements

Tooltip must:

- Render non-interactive content.
- Use `role="tooltip"` on the tooltip content.
- Show on hover.
- Show on keyboard focus.
- Hide on mouse leave.
- Hide on blur.
- Hide on Escape.
- Preserve the trigger child’s existing event handlers.
- Add `aria-describedby` to the trigger when appropriate.
- Generate a stable tooltip id.

Tooltip must not:

- Be the only accessible name for an icon-only control.
- Contain buttons, links, inputs, or other interactive elements.
- Contain essential information.
- Require hover-only access.

## Trigger guidance

The trigger child should already be accessible.

For Icon Button, keep `aria-label` on the Icon Button even when Tooltip content matches the label.

Correct:

```tsx
<Tooltip content="Delete">
  <IconButton aria-label="Delete">
    <TrashIcon />
  </IconButton>
</Tooltip>
```

Incorrect:

```tsx
<Tooltip content="Delete">
  <IconButton>
    <TrashIcon />
  </IconButton>
</Tooltip>
```

## Behavior requirements

Support:

- hover trigger
- focus trigger
- Escape dismissal
- disabled tooltip state
- configurable placement
- configurable delay
- truncation

Initial implementation does not need collision detection or automatic flipping.

## Placement requirements

Support:

```txt
top
right
bottom
left
```

Default placement is `top`.

## Content requirements

Tooltip content should be short and concise.

Recommended:

```txt
Short and brief
```

Avoid:

```txt
Long instructional content that users need to complete a task.
```

## Truncation behavior

When `truncate` is true:

- Use a single line.
- Use text ellipsis.
- Use max width of 420px.

When `truncate` is false:

- Allow wrapping.
- Use max width of 240px.
- Keep content readable.

## Visual requirements

Use Figma visual mapping:

```txt
background: color/background/neutral/bold/default
content: color/content/inverse
typography: body-sm
radius: 4px
padding-x: spacing-075
padding-y: spacing-025
gap: spacing-050
max-width, wrapped: 240px
max-width, truncated: 420px
```

Use actual project token names.

## Token usage

Use semantic tokens for:

- background color
- text color
- typography
- radius
- spacing

Do not hardcode:

- colors
- spacing
- typography values
- radius
- z-index, unless no token exists

## Storybook requirements

Use current simplified story structure:

- Playground
- Variants
- Examples

Do not create separate States or Accessibility pages.

Stories should show:

- default tooltip
- each placement
- truncation true
- truncation false
- disabled tooltip
- tooltip wrapping Icon Button
- tooltip wrapping text Button
- Escape behavior if practical

## Test requirements

Test:

- renders child trigger
- does not show tooltip initially
- shows on hover
- hides on mouse leave
- shows on focus
- hides on blur
- hides on Escape
- applies `role="tooltip"`
- applies `aria-describedby` to trigger when shown or consistently if implemented that way
- preserves child event handlers
- respects `disabled`
- supports placements
- supports truncation
- forwards className where appropriate

Avoid brittle pixel tests.

## Do not include

Do not add collision detection in the first pass.

Do not add portal behavior unless the project already has a portal/layer pattern.

Do not support interactive content.

Do not use Tooltip as accessible name for icon-only controls.

Do not use MUI, Tailwind, or floating-ui unless already installed and approved.
