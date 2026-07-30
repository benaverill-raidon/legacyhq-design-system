# Link Button

## Purpose
A Link Button navigates users while adopting the visual appearance of a Button.

## When to use
Use when navigation should be visually emphasized as a button.

## When not to use
Do not use for actions that only affect the current page. Use Button instead.

## Design intent
Preserve native link semantics while sharing Button appearance, sizing, and interaction patterns.

Shares Button's motion treatment: hover/pressed/focus color transitions use `fade-quick`, and a pressed-state `scale(0.98)` uses `move-quick`.

## Accessibility
Must expose an accessible name, retain anchor semantics, and provide a visible focus indicator.

## Related
Button, Link, Icon Button.
