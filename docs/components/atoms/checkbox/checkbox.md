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

The check mark (and indeterminate mark) pop in with a brief scale-up using `move-quick` (the spring-eased motion token) rather than appearing instantly, the same physical-feedback idea as Switch's thumb bounce.

## Related
Radio, Switch
