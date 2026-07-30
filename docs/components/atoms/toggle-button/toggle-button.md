# Toggle Button

## Purpose
A Toggle Button allows users to switch between selected and unselected states while remaining visually represented as a button.

## When to use
Use for persistent on/off formatting, filtering, or view options.

## When not to use
Do not use for navigation or momentary actions.

## Design intent
Combine the familiarity of a button with a persistent selected state. The icon-to-text gap is a
constant 6px at every size, and the icon itself is never resized by the component, matching Button.

Shares Button's hover/pressed/focus `fade-quick` color transitions and pressed-state `scale(0.98)`
(`move-quick`). Becoming selected additionally plays a brief scale-up-then-settle pop
(`move-quick`, 1 -> 1.06 -> 1) so switching a persistent state on reads as a distinct moment, not
just a color change - the same physical-feedback idea as Switch's thumb bounce.

## Accessibility
Expose pressed state using `aria-pressed`, support keyboard interaction, and provide visible focus.

## Related
Button, Icon Button, Toggle Icon Button.
