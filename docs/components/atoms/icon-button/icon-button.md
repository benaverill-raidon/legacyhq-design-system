# Icon Button

## Purpose
An icon-only button performs a common action where space is limited.

## When to use
Use for well-known actions supported by a tooltip.

## When not to use
Do not use when text is necessary to clarify the action.

## Design intent
Matches Button sizing and appearance while using only an icon.

Shares Button's `isInverse` on-dark treatment - an orthogonal boolean (not part of the appearance axis) for an Icon Button placed on a dark or bold-colored surface such as Banner. It renders a transparent fill with inverse content and the white subtle hover/press/expanded overlays, and is flattened by `disabled`.

Shares Button's motion treatment exactly: hover/press/focus color transitions use `fade-quick`. No press-state scale or other transform-based motion - press feedback is color-only.

## Accessibility
Requires an accessible name and should display a tooltip on hover/focus. The public prop is named `disabled`, matching the native `button` attribute directly, not a custom `isDisabled` prop.

## Related
Button, Link Button, Toggle Icon Button, Tooltip, Icon.
