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
type PopupAlignment = 'topStart' | 'topEnd' | 'topCenter' | 'bottomStart' | 'bottomEnd' | 'bottomCenter';
/** @deprecated Physical names, still accepted and placed as topStart/topEnd/bottomStart/bottomEnd. */
type DeprecatedPopupAlignment = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
type PopupPadding = 'none' | 'sm' | 'md' | 'lg';

interface PopupProps {
  children: React.ReactElement;
  content: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: PopupAlignment | DeprecatedPopupAlignment;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  id?: string;
  role?: React.AriaRole;
  'aria-label'?: string;
  'aria-labelledby'?: string;
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
alignment: topStart
closeOnEscape: true
closeOnOutsideClick: true
unstyled: false
padding: lg
manageTriggerAria: true
matchTriggerWidth: false
```

`alignment`'s default of `topStart` matches the Figma component set's own declared default variant
(`alignment: "top left"`) - it is not necessarily the most common runtime placement (a click-opened
menu more typically opens below its trigger), but there is no product signal in the source file to
override it, so the spec follows Figma exactly rather than guessing.

Alignment is named by logical start and end (`topStart`, `bottomEnd`), as Table and Form name it
(component-api-governance.json, shared-value-names); Figma's variants are still physical (`top
left`, `bottom right`). The physical names `topLeft`, `topRight`, `bottomLeft`, and `bottomRight`
were renamed on 2026-10-20 and stay accepted as deprecated aliases, placed the same. Placement is
left-to-right only: start is the trigger's left edge and end its right edge, even in a right-to-left
page.

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
- Escape goes to the topmost open layer only. Every open Popup registers as a layer
  (`useLayer` in `primitives/layers.ts`, shared with Modal Dialog), even with `closeOnEscape`
  off, and acts on Escape only when it's the topmost layer still open; claiming the key calls
  `preventDefault()`, and an Escape that content inside already handled that way isn't claimed.
  Popup and Modal Dialog provide their layer to what they show (`LayerContext`), so a layer opened
  from inside another is always above it, whichever registered first: React runs a child's effects
  before its parent's, so a dialog and the menu inside it that mount already open in the same
  render register the menu first. Otherwise layers order by when they open. So a menu or tooltip
  opened inside a dialog, or inside another Popup, closes first.
- Reading the trigger child's own ref from `child.props.ref` (React 19 passes `ref` as a prop;
  `element.ref` is deprecated and warns in development), merged with Popup's measurement ref.

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
- `aria-label` and `aria-labelledby` are set on the panel, never the trigger. A role that needs a
  name (`dialog`, `menu`) gets `aria-labelledby` pointing at a visible heading in the content when
  there is one, so what people see and hear match, and `aria-label` otherwise. A `tooltip` is named
  by its text and needs neither.
- Does not manage focus. Moving focus into the panel on open, or returning it to the trigger on
  close, is left to the consumer - a generic primitive can't assume the right focus target for
  every future use case (a menu wants its first item focused; an inline confirmation might not want
  a focus move at all).

## Positioning

Popup uses a local fixed-position portal implementation, and is the shared floating-position
primitive going forward - Tooltip renders through it (with `unstyled`) rather than maintaining its
own copy, which it did before Popup existed:

- Renders in a portal at `document.body` to avoid clipping inside overflow containers.
- Supports the six `alignment` values as a preference (plus the four deprecated physical names).
- Falls back to whichever of the six alignments overflows the viewport least when the preferred one
  doesn't fit, exposed via `data-alignment` on the panel. On a tied overflow, the same alignment on
  the opposite side (e.g. `topCenter` -> `bottomCenter`) wins over an unrelated alignment, so a
  consumer's horizontal-alignment intent survives the fallback.
- Recalculates on trigger/panel resize (via `ResizeObserver`), window resize, and scroll.
- The gap between trigger and panel is `--spacing-sm` (8px), matching the Figma component's own
  `itemSpacing` - not exposed as a prop. Inside an editable Table cell (`EditableCellContext`) it's
  `--spacing-xs` (4px). The panel also stays at least `--spacing-sm` inside the viewport.
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
`padding` below), corner radius (`--border-radius-lg`, 8px), and the overlay elevation shadow
(`--elevation-shadow-overlay`, Figma's `elevation.shadow.overlay` effect style: an inner ring, an 8px
drop, and a 1px perimeter).

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
`elevation.shadow.raised`'s light-to-dark alpha-tier shift (brand-taupe alpha 1100 → 1200, both
themes now on the unified taupe ramp) at the same percentages, since the dark variant of the
overlay effect wasn't independently re-verified in Figma.

The panel hugs its content on both axes (`display: inline-flex`, no explicit width/height) rather
than filling an ambient container - this matches the Figma component's inner `Slot`, which is set
to `HUG` on both `layoutSizingHorizontal` and `layoutSizingVertical`.

The panel fades in on mount with the `fade-quick` motion recipe, as a CSS `@keyframes` animation
rather than a `transition`, since the panel mounts and unmounts instead of toggling a class. There's
no exit animation: the panel is removed as soon as `open` is false. Under
`prefers-reduced-motion: reduce` the animation's duration is 0ms.

The panel's `z-index` is set inline from `LAYERS.popup` (1200) in `primitives/layers.ts`, the one
place the overlay stacking order lives: Modal Dialog (`LAYERS.dialog`, 1000), then Toast Group
(`LAYERS.toast`, 1100), then Popup. So a Popup opened inside a Modal Dialog or over the toast stack
renders above it. A Popup adds its layer depth (`layer.depth` from `useLayer`: how many dialogs and
popups it's inside), so one opened from another Popup's content paints above it even when both
mount open in the same render, when the outer panel's portal lands later in the DOM. z-index isn't
a design token (it has no Figma counterpart or theme).

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
consumer (`role="status"`), the shapes Dropdown Menu and Inline Message build on.

### EdgeCases story

Show:

- alignment falling back near a viewport edge (verify the resolved `data-alignment` differs from
  the requested one)
- Escape/outside-click dismissal with default flags
- `closeOnEscape`/`closeOnOutsideClick` both set to `false`
