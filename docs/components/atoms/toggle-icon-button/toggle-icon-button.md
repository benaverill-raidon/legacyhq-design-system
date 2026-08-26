# Toggle Icon Button

## Purpose
A Toggle Icon Button allows users to switch between selected and unselected states using an icon-only button.

## When to use
Use for persistent icon-based controls where space is limited.

## When not to use
Do not use for navigation or when the action cannot be understood without text.

## Design intent
Provide the compact footprint of an Icon Button while maintaining a persistent pressed state. The
icon itself is never resized by the component, and `shape="round"` is a full circle at every size.

Shares Icon Button's hover/press/focus `fade-quick` color transitions. No press-state scale, and
becoming selected is a plain color change with no pop/scale motion - transform-based feedback has
been removed from this component, matching Toggle Button.

## Accessibility
Requires an accessible name, exposes `aria-pressed`, provides visible focus, and should be paired with a tooltip.

## Related
Toggle Button, Icon Button, Tooltip.
