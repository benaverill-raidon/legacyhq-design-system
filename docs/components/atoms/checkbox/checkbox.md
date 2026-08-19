# Checkbox

## Purpose
Checkbox allows users to select one or more independent options.

## When to use
- Multiple independent selections
- Boolean settings

## Accessibility
Uses a native checkbox input and supports keyboard interaction and visible focus.

## Design intent
The hover/pressed/focus overlay behind the indicator fades in using the `fade-quick` semantic motion token rather than a hardcoded duration.

The check mark (and indeterminate mark) appear instantly on toggle, with no scale-up or other transform-based animation.

## Related
Radio, Switch
