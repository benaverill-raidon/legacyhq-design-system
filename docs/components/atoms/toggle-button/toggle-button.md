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

Shares Button's hover/press/focus `fade-quick` color transitions. No press-state scale, and
becoming selected is a plain color change with no pop/scale motion - transform-based feedback has
been removed from this component.

## Accessibility
Expose pressed state using `aria-pressed`, support keyboard interaction, and provide visible focus.

## Related
Button, Icon Button, Toggle Icon Button.
