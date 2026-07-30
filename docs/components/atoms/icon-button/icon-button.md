# Icon Button

## Purpose
An icon-only button performs a common action where space is limited.

## When to use
Use for well-known actions supported by a tooltip.

## When not to use
Do not use when text is necessary to clarify the action.

## Design intent
Matches Button sizing and appearance while using only an icon.

Shares Button's motion treatment exactly: hover/pressed/focus color transitions use `fade-quick`, and a pressed-state `scale(0.98)` uses `move-quick` for tactile feedback.

## Accessibility
Requires an accessible name and should display a tooltip on hover/focus. The public prop is named `disabled`, matching the native `button` attribute directly, not a custom `isDisabled` prop.

## Related
Button, Link Button, Toggle Icon Button, Tooltip, Icon.
