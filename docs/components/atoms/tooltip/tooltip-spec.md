# Tooltip Component Spec

## Overview

Tooltip is a reusable standalone component that displays short, non-interactive supplemental information for a trigger element.

## Anatomy

```txt
Tooltip
+- trigger child
+- optional pointer wrapper for disabled controls
+- Popup (unstyled, alignment="topCenter")
   +- tooltip content layer (role="tooltip", Tooltip's own visual skin)
```

## Public API

```ts
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  truncate?: boolean;
  disabled?: boolean;
  delay?: number;
  className?: string;
}
```

## Defaults

```txt
truncate: true
disabled: false
delay: 300
```

There is no `placement` prop. Tooltip always requests Popup's `topCenter` alignment and relies on
Popup's own viewport-fit fallback across all six of its alignments instead of exposing manual
per-instance placement control - see Positioning below.

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

Tooltip renders through `Popup` (`packages/ui/src/components/primitives/popup`) with `unstyled` set,
passing `alignment="topCenter"`, `role="tooltip"`, `manageTriggerAria={false}`, and both
`closeOnEscape`/`closeOnOutsideClick` set to `false`. Popup owns:

- the portal at `document.body`, avoiding clipping inside overflow containers
- positioning relative to the trigger, and falling back across its six alignments (starting with
  `topCenter`, then `bottomCenter`, matching Popup's same-alignment-opposite-side fallback
  preference) when the preferred one would overflow
- recalculating on trigger/panel resize, window resize, and scroll
- the mount fade animation

Tooltip does not use Popup's own dismissal (`closeOnEscape`/`closeOnOutsideClick` are both `false`)
because Tooltip already owns dismissal itself via hover/focus/blur/Escape-on-the-trigger, which
predates Popup and has different semantics (a hover-triggered hint has no "outside click" concept).
Tooltip also does not use Popup's `aria-expanded`/`aria-controls` wiring (`manageTriggerAria={false}`)
since those are disclosure-widget attributes that don't apply to a supplemental hint - Tooltip's own
`aria-describedby` wiring, unchanged, is the correct ARIA pattern here.

One visible consequence of centralizing on Popup: the gap between trigger and tooltip is now
Popup's fixed `--spacing-sm` (8px), not Tooltip's previous `--spacing-xs` (4px) - a deliberate
tradeoff for having positioning logic originate from one place across every Popup-based component.

## Styling and tokens

Tooltip uses semantic color, typography, spacing, and radius tokens: background
(`color-background-neutral-bold-default`), content color (`color-content-inverse`), corner radius
(`border-radius-sm`, 4px), vertical padding (`spacing-xxs`, 2px), and content gap (`spacing-xs`,
4px) - all verified directly against Figma's tooltip-primitive frame.

Horizontal padding is `--measurement-6` (6px) - a raw measurement rather than a named spacing token,
since Figma's own value doesn't land on the 4/8/12/16px spacing scale. A prior implementation used
`--spacing-sm` (8px) here, which was 2px too wide.

There is no arrow/caret pointing at the trigger - Figma's tooltip is a plain rounded rectangle.

Tooltip-specific layout constraints remain private implementation values:

- z-index: `1`
- truncated max width: `420px`
- wrapped max width: `240px`

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

## Storybook

Unified story structure, minus Sizes/States - Tooltip has no `size` prop, and Figma's own variant
properties are only `truncate` and `showTooltip`, so there's no static interactive-state axis to
pin. The only "state" is shown/hidden, already demonstrated live by hovering/focusing the
Playground trigger:

```txt
Tooltip
├─ Docs (.mdx)
├─ Playground
├─ Variants
├─ Content
└─ EdgeCases
```

### Variants story

Show `truncate`, plus `disabled`. No placement axis - see "Positioning is entirely Popup's job" above.

### Content story

Show:

- icon-only actions
- toggle icon buttons
- disabled-control explanations
- a text button trigger

### EdgeCases story

Show:

- alignment falling back near a viewport edge (verify the resolved `data-alignment` on the Popup
  panel differs from `topCenter`)
- keyboard-focus trigger
- dark surface
