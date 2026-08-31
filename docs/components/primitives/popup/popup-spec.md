# Popup Component Spec

## Overview

Popup is a reusable primitive that anchors a floating panel of arbitrary, potentially interactive
content to a trigger element. It owns positioning and dismissal. Its default visual skin matches
Figma's `popup` component, but that skin is entirely optional (`unstyled`) - a consumer can build a
completely different visual design on top of the same positioning/portal/dismissal mechanics.

## Anatomy

```txt
Popup
+- trigger child (cloned, receives a measurement ref + aria-expanded/aria-controls unless manageTriggerAria=false)
+- floating panel (portal at document.body, position: fixed, optional default visual skin)
   +- content (whatever the consumer passes via `content`)
```

## Public API

```ts
type PopupAlignment = 'topLeft' | 'topRight' | 'topCenter' | 'bottomLeft' | 'bottomRight' | 'bottomCenter';
type PopupPadding = 'none' | 'sm' | 'md' | 'lg';

interface PopupProps {
  children: React.ReactElement;
  content: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: PopupAlignment;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  id?: string;
  role?: React.AriaRole;
  className?: string;
  unstyled?: boolean;
  padding?: PopupPadding;
  manageTriggerAria?: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
  matchTriggerWidth?: boolean;
}
```

## Defaults

```txt
alignment: topLeft
closeOnEscape: true
closeOnOutsideClick: true
unstyled: false
padding: lg
manageTriggerAria: true
matchTriggerWidth: false
```

`alignment`'s default of `topLeft` matches the Figma component set's own declared default variant
(`alignment: "top left"`) - it is not necessarily the most common runtime placement (a click-opened
menu more typically opens below its trigger), but there is no product signal in the source file to
override it, so the spec follows Figma exactly rather than guessing.

## Trigger behavior

Popup does not open or close itself. `open` is a required, fully controlled prop - the consumer's
own trigger interaction (typically a click) is responsible for flipping it. This differs
deliberately from Tooltip, which owns hover/focus triggering internally; Popup's future consumers
(a click-to-open menu, a programmatically-shown confirmation) want different triggering semantics,
so Popup stays out of that decision entirely.

What Popup does own, once `open` becomes true:

- Positioning the panel relative to the trigger.
- Calling `onOpenChange(false)` on Escape (`closeOnEscape`, default `true`) and on a pointer press
  outside both the trigger and the panel (`closeOnOutsideClick`, default `true`).

Popup does not change its own visibility in response to Escape/outside click - it only calls
`onOpenChange`. If the consumer doesn't provide `onOpenChange`, dismissal has no visible effect,
same as any other controlled component with no change handler.

## Anchor & width matching

By default the cloned trigger child is the element Popup measures (for positioning), treats as the
inside of the outside-click boundary, and observes for resizes. Two optional props separate "what to
measure" from "what carries the ref + ARIA":

- `anchorRef` — when set, Popup measures, positions, width-matches, resize-observes, and
  dismiss-bounds against this element instead of the trigger child. The trigger child still receives
  the merged measurement ref and (unless `manageTriggerAria=false`) `aria-expanded`/`aria-controls`;
  only the geometry/boundary follows the anchor. This exists for a control whose ARIA-bearing element
  is smaller than its visible frame — Select's trigger is an `<input>` (where `aria-expanded` belongs)
  inset within a bordered field frame, and the panel must align to the frame, not the inset input.
- `matchTriggerWidth` (default `false`) — sizes the panel to the measured element's width (the
  `anchorRef` element, or the trigger child) rather than letting it hug its own content. The panel
  content must be able to fill that width; the panel picks up the measured width as an inline
  `width`, re-measured on the same resize/scroll updates as position.

Both are inert on their own for existing consumers — width still hugs content and the trigger child
is still the measured element unless these are passed.

## Content rules

`content` may be any `React.ReactNode`, including interactive elements (buttons, links, form
controls) - unlike Tooltip, Popup content is not restricted to non-interactive material.

Popup renders nothing but the cloned trigger when `open` is `false` - no empty portal node is left
mounted.

## Accessibility

- Sets `aria-expanded` on the trigger, reflecting `open`, unless `manageTriggerAria` is `false`.
- Sets `aria-controls` on the trigger to the panel's id while `open` is `true`, unless
  `manageTriggerAria` is `false`; preserves whatever `aria-controls` the trigger already had while
  closed.
- `manageTriggerAria` (default `true`) exists because `aria-expanded`/`aria-controls` are
  disclosure-widget attributes - correct for a menu/popover trigger, but wrong for a trigger that
  already has its own ARIA relationship to the panel content (Tooltip's `aria-describedby`). Set it
  to `false` in that case rather than shipping a second, conflicting ARIA relationship.
- Does not set a `role` on the panel by default - `role` is an optional prop the consumer supplies
  once it knows what it's building (`menu`, `dialog`, `status`, `tooltip`, ...).
- Does not manage focus. Moving focus into the panel on open, or returning it to the trigger on
  close, is left to the consumer - a generic primitive can't assume the right focus target for
  every future use case (a menu wants its first item focused; an inline confirmation might not want
  a focus move at all).

## Positioning

Popup uses a local fixed-position portal implementation, and is the shared floating-position
primitive going forward - Tooltip renders through it (with `unstyled`) rather than maintaining its
own copy, which it did before Popup existed:

- Renders in a portal at `document.body` to avoid clipping inside overflow containers.
- Supports the six `alignment` values as a preference.
- Falls back to whichever of the six alignments overflows the viewport least when the preferred one
  doesn't fit, exposed via `data-alignment` on the panel. On a tied overflow, the same alignment on
  the opposite side (e.g. `topCenter` -> `bottomCenter`) wins over an unrelated alignment, so a
  consumer's horizontal-alignment intent survives the fallback.
- Recalculates on trigger/panel resize (via `ResizeObserver`), window resize, and scroll.
- The gap between trigger and panel is a fixed `--spacing-sm` (8px), matching the Figma component's
  own `itemSpacing` - not exposed as a prop.
- When the trigger's bounding rect ends up fully outside the viewport on any one of its four edges
  (checked every time position recalculates), the panel is hidden (`visibility: hidden`,
  `data-trigger-out-of-view="true"`) instead of being clamped to the nearest viewport edge.
  Clamping alone left the panel visibly stuck at that edge once the trigger scrolled away entirely
  - floating with no visible anchor, since nothing was actually pointing at it anymore. The check
  is gated on the trigger having a measured, nonzero width or height, so an element that hasn't
  been laid out at all (e.g. a test that doesn't mock `getBoundingClientRect`) is never
  misidentified as "out of view" at `(0,0,0,0)`. Normal positioning resumes automatically, with no
  extra state to reset, the next time the trigger is back in view (even partially).

## Styling and tokens

The panel uses semantic color, spacing, radius, and shadow tokens, all verified directly against
Figma's `popup` component set: background (`--color-elevation-surface-raised-default`), border
(`--border-width-sm` `--color-border-default`), padding (`--spacing-lg`, 16px, by default - see
`padding` below), corner radius (`--border-radius-lg`, 8px), and a three-layer shadow matching
Figma's `elevation.shadow.overlay` effect style (`--color-elevation-shadow-overlay-inner`,
`-spread`, `-perimeter`).

### Padding

`padding` (`'none' | 'sm' | 'md' | 'lg'`, default `'lg'`) maps to
`0`/`--spacing-sm`/`--spacing-md`/`--spacing-lg` and is applied via its own dedicated class
(`padding_none`/`padding_sm`/`padding_md`/`padding_lg`), separate from `panelSurface`'s other
properties (background/border/radius/shadow/gap). This lets a consumer with denser content - a
menu's rows, for instance - size just the padding while still sharing the rest of the skin from one
source, rather than either fighting `panelSurface`'s padding with a CSS override or reaching for
`unstyled` and redeclaring the entire skin (background/border/radius/shadow) itself. `none` covers a
consumer whose own content already carries all of its edge padding - Dropdown Menu's Menu panel,
added 2026-08-19, is the first: its search field and rows already have their own insets, so any
nonzero Popup padding would double them up. Reserve `unstyled` for a consumer with a genuinely
different visual design (Tooltip); reach for `padding` when only the padding needs to differ.
Ignored when `unstyled` is `true` - there's no skin to size in the first place.

`-spread` and `-perimeter` are two semantic color tokens added alongside this component -
`color-elevation-shadow-overlay-default`/`-inner` already existed, but the alpha-blended layers
Figma's effect actually uses were missing. They mirror the existing `elevation.shadow.raised`
family's structure (`default`/`spread`/`perimeter`/`inner`) and the exact alpha values (16%, 32%)
read directly off the Figma effect (`Light/elevation.shadow.overlay`); the dark-theme values mirror
`elevation.shadow.raised`'s light-to-dark base-hue swap (brand-umber → neutral) at the same
percentages, since the dark variant of the overlay effect wasn't independently re-verified in
Figma.

The panel hugs its content on both axes (`display: inline-flex`, no explicit width/height) rather
than filling an ambient container - this matches the Figma component's inner `Slot`, which is set
to `HUG` on both `layoutSizingHorizontal` and `layoutSizingVertical`.

Content items inside the panel get `--spacing-xs` (4px) of gap when there's more than one, matching
the Figma component's own inner `itemSpacing`.

All of the above (background/border/padding/radius/shadow/content-gap) lives in a separate
`.panelSurface` class, not the base `.panel` class - `.panel` carries only structural positioning
(`position: fixed`, content-hugging size, the mount animation). Setting `unstyled` skips
`.panelSurface` entirely, so a consumer with a completely different visual design (Tooltip) never
has to override Popup's default skin with competing CSS - there's nothing to override.

## Storybook

```txt
Popup
├─ Docs (.mdx)
├─ Playground
├─ Variants
├─ Content
└─ EdgeCases
```

No Sizes or States pages - Popup has no `size` prop (it sizes to its content), and its only "state"
is open/closed, which every other story already demonstrates live via a real trigger click rather
than a pinned static reference.

### Variants story

Show all six `alignment` values, each with its own independently-clicked trigger.

### Content story

Show Popup as the foundation for a menu-shaped consumer (`role="menu"`) and a short-message-shaped
consumer (`role="status"`), previewing the two documented future consumers (Dropdown Menu, Inline
Message) without building either.

### EdgeCases story

Show:

- alignment falling back near a viewport edge (verify the resolved `data-alignment` differs from
  the requested one)
- Escape/outside-click dismissal with default flags
- `closeOnEscape`/`closeOnOutsideClick` both set to `false`
