# Tooltip Component Spec

## Overview

Tooltip is an atom that displays a short, non-actionable floating label for a trigger element.

It explains or clarifies an existing user interface element or feature. It should not contain essential information or interactive controls.

## Description

A tooltip is a floating, non-actionable label used to explain a user interface element or feature.

## Design note

In Figma, Tooltip is modeled as:

```txt
Tooltip component
├─ Slot {children}
└─ Tooltip primitive
```

In code, Tooltip should be implemented as a wrapper component that owns trigger behavior and renders an internal visual content primitive.

Recommended implementation model:

```txt
Tooltip
├─ trigger child
└─ TooltipContent, internal visual primitive
```

The visual primitive can be a private/internal component. It does not need to be exported publicly in the first pass.

## When to use

Use Tooltip to provide supplemental clarification for:

- icon-only buttons
- toolbar actions
- short feature explanations
- abbreviated labels
- controls that benefit from extra context

## When not to use

Do not use Tooltip for:

- essential task instructions
- error messages
- validation feedback
- long help text
- interactive content
- content users must access on touch devices
- replacing visible labels or accessible names

## Accessibility principle

Tooltip content should describe or clarify a control, not name it.

Icon-only controls still need an accessible name.

Correct:

```tsx
<Tooltip content="Edit">
  <IconButton aria-label="Edit">
    <EditIcon />
  </IconButton>
</Tooltip>
```

Incorrect:

```tsx
<Tooltip content="Edit">
  <IconButton>
    <EditIcon />
  </IconButton>
</Tooltip>
```

## Public API

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

## Trigger

Tooltip accepts a single React element as its child.

The implementation may clone the child to attach event handlers and `aria-describedby`.

If cloning the child, preserve existing child props and event handlers:

- `onMouseEnter`
- `onMouseLeave`
- `onFocus`
- `onBlur`
- `onKeyDown`
- `aria-describedby`
- `className`
- `ref`, where possible

## Content

`content` may be text or simple React content.

Content must be non-interactive.

Do not render buttons, links, inputs, menus, or other focusable elements inside Tooltip.

## Role and relationship

Tooltip content should use:

```tsx
role="tooltip"
```

The trigger should be associated with the tooltip using:

```tsx
aria-describedby={tooltipId}
```

Recommended: apply `aria-describedby` while tooltip is visible.

Acceptable: apply `aria-describedby` consistently when `content` exists, as long as the tooltip id is stable and the content is present in the DOM.

## Visibility behavior

Tooltip should show when:

- trigger is hovered
- trigger receives keyboard focus

Tooltip should hide when:

- mouse leaves trigger and tooltip area
- trigger loses focus
- Escape is pressed
- `disabled` is true

## Delay

Tooltip should support a configurable delay.

Default delay:

```txt
300ms
```

If the project does not have a timer pattern, implement delay conservatively.

## Placement

Supported placements:

```txt
top
right
bottom
left
```

Default:

```txt
top
```

Initial implementation does not need viewport collision detection, flipping, or smart repositioning.

## Positioning

Initial positioning may use CSS absolute positioning relative to a wrapper.

Recommended structure:

```tsx
<span className={styles.root}>
  {trigger}
  {isVisible && (
    <span className={styles.content} role="tooltip" id={tooltipId}>
      {content}
    </span>
  )}
</span>
```

Use project conventions for wrapper display and positioning.

## Visual style

From Figma:

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

Use actual project tokens.

## Truncate behavior

When `truncate` is true:

```txt
single-line
text-overflow: ellipsis
white-space: nowrap
overflow: hidden
max-width: 420px
```

When `truncate` is false:

```txt
wrap content
word-break: break-word
max-width: 240px
```

## Storybook

Create:

```txt
Tooltip / Playground
Tooltip / Variants
Tooltip / Examples
```

Do not create separate States or Accessibility pages.

### Playground controls

```txt
content
placement
truncate
disabled
delay
```

### Variants

Show:

- top
- right
- bottom
- left
- truncate true
- truncate false
- disabled

### Examples

Show:

- Tooltip wrapping Icon Button
- Tooltip wrapping Button
- Tooltip wrapping Toggle Icon Button
- Short tooltip content
- Longer wrapped tooltip content

## Tests

Use Vitest and React Testing Library.

Required tests:

```txt
renders trigger child
hides tooltip initially
shows tooltip on hover
hides tooltip on mouse leave
shows tooltip on focus
hides tooltip on blur
hides tooltip on Escape
sets role tooltip
associates trigger with aria-describedby
respects disabled
applies placement state/class
applies truncate state/class
preserves child event handlers
```

Avoid brittle pixel tests.

## Implementation constraints

Do not use MUI.

Do not use Tailwind.

Do not install floating-ui or Popper in the first pass unless already installed and approved.

Do not add portal behavior unless the project already has a portal/layer utility.

Do not make Tooltip content interactive.

Do not use Tooltip as the accessible name for icon-only controls.

## Future considerations

Potential later enhancements:

- collision detection
- viewport flipping
- portal/layer support
- arrow/caret
- touch-specific behavior
- richer help popover component for interactive content
