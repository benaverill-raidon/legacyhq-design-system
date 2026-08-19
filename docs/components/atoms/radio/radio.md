# Radio

## Purpose
Radio buttons allow users to select a single option from a mutually exclusive group.

## When to use
Use when exactly one option can be selected.

## When not to use
Do not use for multiple independent selections; use Checkbox instead.

## Design intent
Provide a clear single-selection control with consistent indicator, focus treatment, and labeling.
The hover/pressed/focus overlay behind the indicator fades in using the `fade-quick` semantic motion
token rather than a hardcoded duration.

The selected dot appears instantly on toggle, with no scale-up or other transform-based animation,
matching Checkbox.

## Accessibility
Use native radio inputs grouped by a fieldset/legend where appropriate. Support keyboard navigation and visible focus.

## Related
Checkbox, Switch.
