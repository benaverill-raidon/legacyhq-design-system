# Tooltip Component Spec

## Overview

Tooltip is a reusable standalone component that displays short, non-interactive supplemental information for a trigger element.

## Anatomy

```txt
Tooltip
+- trigger child
+- optional pointer wrapper for disabled controls
+- tooltip content layer
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

## Trigger behavior

Tooltip opens on:

- pointer hover
- keyboard focus

Tooltip closes on:

- pointer leave
- blur
- Escape
- `disabled={true}`

Preserve consumer event handlers. If a consumer handler calls `event.preventDefault()`, Tooltip must skip its corresponding internal behavior.

## Content rules

Tooltip does not render or attach behavior when `content` is absent, including:

- `null`
- `undefined`
- empty string

Tooltip content must remain non-interactive.

## Accessibility

- Use `role="tooltip"`.
- Preserve existing `aria-describedby` values.
- Add the tooltip id to `aria-describedby` only while the tooltip is rendered.
- Do not create extra keyboard tab stops.
- Tooltip content must not replace the trigger's accessible name.

## Disabled native controls

Tooltip supports disabled native controls by using a non-focusable pointer wrapper.

Requirements:

- the child control remains natively disabled
- the wrapper is not keyboard-focusable
- pointer hover may reveal a tooltip explanation
- keyboard users are not told the disabled control is interactive

## Positioning

This repository does not currently expose a shared overlay or floating-position utility.

Tooltip therefore uses a small local fixed-position portal implementation that:

- avoids clipping inside overflow containers
- supports `top`, `right`, `bottom`, and `left` preferred placements
- shifts or falls back when the preferred placement would overflow
- recalculates when trigger, tooltip, scroll, resize, or viewport geometry changes

## Styling and tokens

Tooltip uses semantic color, typography, spacing, and radius tokens.

Tooltip-specific component tokens own:

- `--component-tooltip-z-index`
- `--component-tooltip-max-width-truncated`
- `--component-tooltip-max-width-wrapped`

## Icon-only controls

Tooltip is especially appropriate for:

- icon-only buttons
- toggle icon controls
- disabled control explanations
- truncated content
- short supplemental clarification

External composition remains supported:

```tsx
<Tooltip content="Custom explanation">
  <IconButton aria-label="Edit" tooltip={false}>
    <EditIcon />
  </IconButton>
</Tooltip>
```
