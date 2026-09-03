# Inline Message Component Spec

## Overview

Inline Message is a reusable molecule that shows a short, tone-colored status row - an icon, a bold
title, and optional secondary text - with optional additional detail revealed in a popup on click.

## Anatomy

```txt
InlineMessage
+- icon slot (24px, matches Icon's spacing="spacious" container)
|  +- tone-mapped status icon, or a plain dot for tone="default"
+- text
|  +- title (required)
|  +- secondaryText (optional)
+- Popup (default styled skin, alignment="bottomLeft") - only when `content` is provided
   +- detail content
```

When `content` is omitted, the whole row renders as a plain `div` - no button, no Popup, no
`aria-expanded`.

## Public API

```ts
export type InlineMessageTone = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface InlineMessageProps {
  title: React.ReactNode;
  secondaryText?: React.ReactNode;
  tone?: InlineMessageTone;
  content?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
```

## Defaults

```txt
tone: 'default'
defaultOpen: false
```

There is no `disabled` prop - not evidenced anywhere in Figma's `inline-message`/
`inline-message-trigger` component set (only `tone` and `isOpen`/`state`), so it is not invented.

## Design Decisions Beyond the Literal Figma Sample

Figma's `inline-message` component set (node `4589:2519`, file `Components v1.0.0`) wraps a real
`popup` instance around a `figma-parts / inline-message-trigger` sub-component (node `2448:72904`).
The trigger's own `state` variant includes `default`, `hover/open`, `focus`, and `press` - a
single merged `hover/open` state name, not two separately demonstrated ones. Read literally this
is ambiguous between "hover reveals the panel" (mirroring Tooltip) and "click toggles it, and the
open/hover tint happens to share one visual treatment." This was resolved in favor of
**click-to-toggle**, not hover, because:

- Popup's own documentation is explicit that hover-only reveals belong to Tooltip, not to a
  Popup-based component - reusing that pattern here would just duplicate Tooltip's territory.
- The `press` state only makes sense for a real, clickable control, not a hover-only trigger.
- Hover-only reveals exclude keyboard and touch users from ever seeing the detail; a real button
  does not.

Figma's trigger's `secondaryText#…`/`showSecondaryText#…` and `titleText#…`/`showTitle#…`
component properties (a text value plus a separate boolean toggle for whether it renders) are
collapsed to presence/absence of the `secondaryText` prop in the React API - `title` has no
matching `showTitle` toggle since every real-world example provides one, consistent with how this
system always uses presence/absence rather than a parallel boolean flag for optional content
(compare Radio's `label`).

Open state maps from the **nested** `popup` instance's own `isOpen` component property, not from the
outer variant name - the outer set crosses `tone` with `isOpen`, so the nested property is what
actually distinguishes an open trigger from a closed one within a single tone.

## Tone Mapping

Verified directly from Figma's bound variables on each tone's trigger instance - the icon glyph,
its resting color, and the tint shown on hover/open all confirmed per tone, not assumed to follow a
pattern from one sample:

| Tone | Icon | Icon color | Hover/open tint |
|------|------|------------|------------------|
| `default` | plain dot (no matching status icon in the generated set - see below) | `--color-content-default` | `--color-background-neutral-overlay-bold-hover` |
| `info` | `StatusInformationIcon` | `--color-content-information` | `--color-background-information-overlay-hover` |
| `success` | `StatusSuccessIcon` | `--color-content-success` | `--color-background-success-overlay-hover` |
| `warning` | `StatusWarningIcon` | `--color-content-warning` | `--color-background-warning-overlay-hover` |
| `error` | `StatusErrorIcon` | `--color-content-error` | `--color-background-error-overlay-hover` |

Figma's `default`-tone icon resolves to a component literally named `node` in the shared icon
library - a generic, unrelated placeholder rather than a real status glyph. No `StatusDefaultIcon`
(or any generic dot/bullet icon) exists in `packages/ui/src/assets/icons/generated/`, confirmed by
inspecting the generated set directly. Fabricating a new status icon that doesn't exist in the
source library was rejected in favor of a plain CSS-drawn dot (`--size-marker-sm`, filled with
`--color-content-default`) - the same category of decision Checkbox/Radio/Switch already make for
their own private decorative marks (drawn with CSS, not shared icon-library assets).

## Layout

Verified directly from Figma's auto-layout data on the trigger sub-component (not assumed
symmetric):

- Icon container: `--size-300` (24px square) - matches `Icon`'s own `spacing="spacious"` value
  exactly, so the plain dot and every real status icon share one consistent slot size.
- The row itself (`.root`) carries no padding of its own - it starts flush with the icon's own
  edge. A native `<button>` (the `content`-provided case) otherwise inherits the UA stylesheet's
  own default button padding (1px block / 6px inline in Chrome), so `.root` resets `padding` to
  `--spacing-none` explicitly rather than leaving it implicit.
- The `--spacing-xs` (4px) padding on both sides of the text group (`.text`) supplies the
  icon-to-title gap and the row's own trailing space after the secondary text - both live on
  `.text`, not on `.root`.
- Gap between title and secondary text: `--spacing-sm` (8px).
- Title typography: `--typography-heading-xs-*` (Public Sans SemiBold, 14px/24px), color
  `--color-content-default`.
- Secondary text typography: `--typography-body-md-*` (Public Sans Regular, 14px), color
  `--color-content-subtle`.

Figma's mockup shows a small intermediate `padding-container` frame between the trigger and the
popup panel - this is a mockup-only artifact of how the demo was assembled, not a real gap value to
replicate: Popup's own position engine already inserts its fixed `--spacing-sm` (8px) gap between
trigger and panel for every Popup-based component, the same way it does for Tooltip.

## Behavior

- Renders a plain, non-interactive `div` when `content` is `null`/`undefined` - no button, no
  `aria-expanded`, no Popup mounted at all.
- Renders a real `<button type="button">` when `content` is provided. Clicking toggles the popup.
- Supports controlled usage via `open`/`onOpenChange`, and uncontrolled usage via `defaultOpen`
  (default `false`) - the standard React controlled/uncontrolled pattern, since (unlike Checkbox's
  `checked`/Radio's `checked`) there is no native form element to delegate this to.
- Uses Popup's **default** styled skin - not `unstyled` - matching Figma's `figma-parts /
  panelSurface` instance inside the popup exactly (a raised card with border/shadow). This is the
  first component in the system to exercise that code path; Tooltip only exercises `unstyled`.
- `alignment="bottomLeft"`, matching Figma's own `popup` instance property on every variant.
- Leaves `closeOnEscape`/`closeOnOutsideClick` at Popup's own defaults (both `true`) - the detail
  dismisses on Escape or an outside click, the same as any other Popup consumer. Popup's own docs
  originally predicted Inline Message would want persistent-until-explicit-toggle behavior, and an
  earlier revision opted out of both to match that prediction - reversed on direct product
  feedback: a status/validation detail row should dismiss like any other transient disclosure, not
  stay pinned open once the user has moved on.
- Leaves `manageTriggerAria` at Popup's default (`true`) - `aria-expanded`/`aria-controls` is the
  correct ARIA pattern for a click-to-reveal disclosure, unlike Tooltip's `aria-describedby` case.
  This is the first component to exercise that default path; Tooltip sets it to `false`.
- The hover/open tint is driven by a single `:is(:hover, :focus-visible, [aria-expanded='true'],
  [data-force-state='hover'], [data-force-state='focus'])` selector per tone - keyboard focus reads
  identically to hover, matching Button/IconButton/ToggleButton's own convention of grouping
  focus-visible into the same rule as hover rather than giving it a separate, differently-colored
  treatment. Reuses Popup's own `aria-expanded` wiring for the open case rather than introducing a
  redundant custom `data-open` attribute.
- `[data-force-state]` mirrors the adjacent pseudo-classes so Storybook can present hover/focus as
  a static regression reference - documentation-only, not part of the public API.

## Accessibility

- The trigger button gets `aria-expanded`/`aria-controls` from Popup automatically.
- The trigger button applies the shared Focus Ring primitive (`focusRingClassNames.focusRing` +
  `focusRingDefault`) for its `:focus-visible` outline - the same pattern every other interactive
  component in this system uses, rather than a one-off focus style local to this component.
- No ARIA role is set on the detail panel - a plain click-to-reveal disclosure needs none beyond
  the trigger's own `aria-expanded`/`aria-controls`, the same reasoning Popup's own docs give for
  not assuming a role by default.
- The icon is always `aria-hidden` - the tone is communicated by the icon or by the tint plus the
  message text, and is never the only communicated signal.

## Styling and Tokens

Semantic tokens only - no primitive references, no hardcoded colors, spacing, or typography. See
Tone Mapping and Layout above for the exact verified values.

## Storybook

Unified story structure:

```txt
Inline Message
├─ Docs (.mdx)
├─ Playground
├─ Variants
├─ Content
└─ EdgeCases
```

### Variants story

All six tones side by side, each with `content` provided.

### Content story

- Title only, no secondary text
- Title and secondary text together
- No `content` - a plain, non-interactive row
- In a form/composition context

### EdgeCases story

- Alignment falling back automatically near a viewport edge
- Long detail content wrapping inside Popup's default width
- Dark surface

## Testing Requirements

- Renders title; renders/omits secondaryText correctly
- Renders a real status icon for a non-default tone; renders a plain dot for `default`
- Renders a plain row (no button) when `content` is omitted
- Renders a real button, with `aria-expanded`, when `content` is provided
- Toggles the popup open/closed on click (uncontrolled)
- Supports `defaultOpen`
- Supports controlled `open`/`onOpenChange`
- Closes on Escape and on an outside click, inherited from Popup
- Applies `className` to the root row
- Maps every tone to its own `overlay/hover` tint token
- Delegates positioning/portal/dismissal to Popup rather than a local implementation
- Reuses Popup's own `aria-expanded` wiring rather than a custom open attribute

## Known Limitations

- No `disabled` prop - not evidenced in Figma's own component set.
- No built-in max-width/truncation behavior for the title/secondary text row itself (Popup's panel
  already wraps long `content`).

## Future Enhancements

- A `disabled` prop if a real product need for it emerges.
