# Popup

## Purpose
Popup anchors a panel of arbitrary content to a trigger element, positions it so it doesn't clip
the viewport, and dismisses it on Escape or an outside click. It is the shared floating-panel
primitive other components are built on top of - Tooltip already renders through it, and Dropdown
Menu/Inline Message are planned to as well.

## When to use
Use Popup as the foundation for a new component that shows floating, dismissible content anchored
to a trigger - a menu, a popover, an inline confirmation. Dropdown Menu and Inline Message are
planned components that will build on it. Reach for Popup directly (not Tooltip) when the content
needs to be interactive or dismissal needs to differ from hover/focus semantics.

## When not to use
Do not reach for Popup directly for a non-interactive, hover/focus-triggered hint - use Tooltip,
which already renders through Popup internally (with `unstyled` and its own dismissal semantics) so
you get the positioning for free without re-deriving Tooltip's trigger/content rules. Do not put
content essential to completing a task inside a Popup that scrolls out of view of its trigger.

## Design intent
Popup is controlled, not self-triggering: `open` is a required prop, and the consumer's own trigger
interaction decides when it flips. This is deliberate - a click-to-open menu, a programmatically
opened confirmation, and other future consumers each want different triggering behavior, and baking
one in would fight the others. What Popup does own is everything downstream of `open` actually
changing: measuring the trigger and panel, picking whichever of six alignments overflows the
viewport least, and (by default) calling back to dismiss on Escape or an outside click so most
consumers get that behavior for free instead of re-deriving it.

The panel fades in on mount using the `fade-quick` semantic motion token via a CSS `@keyframes`
animation (not `transition`, since the element mounts/unmounts rather than toggling a class).

Popup's own visual skin (background, border, padding, radius, shadow - matching its Figma source
exactly) is applied by default, but skippable via `unstyled` for a consumer that needs Popup's
positioning/dismissal with a completely different visual design of its own. Tooltip is the first
consumer of this: it sets `unstyled` and layers its own dark-pill styling on top, while still
getting positioning, the portal, and the mount animation from Popup for free.

Padding is the one piece of the skin broken out as its own prop (`padding`, `'sm' | 'md' | 'lg'`,
default `'lg'`) rather than bundled with the rest. A consumer with denser content - a menu's rows,
say - can size just the padding while still sharing background/border/radius/shadow from Popup
directly, instead of either fighting the default padding with a CSS override or reaching for
`unstyled` and redeclaring the whole skin just to change one property.

## Accessibility
By default (`manageTriggerAria`, default `true`) the trigger receives `aria-expanded` reflecting
`open`, and `aria-controls` pointing at the panel's id while open. Set `manageTriggerAria={false}`
when the consumer already manages its own trigger-to-content ARIA relationship - `aria-expanded`/
`aria-controls` are disclosure-widget attributes and don't apply to every consumer (Tooltip uses
`aria-describedby` instead, and sets this to `false`). Popup does not set an ARIA role on the panel
itself - it doesn't know what's being built on top of it, so the consumer passes `role` (`menu`,
`dialog`, `status`, `tooltip`, ...) to match.

## Related
Tooltip (renders through Popup with `unstyled` and its own dismissal semantics), Dropdown Menu and
Inline Message (planned components built on top of this primitive).
