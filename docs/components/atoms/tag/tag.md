# Tag

## Purpose
A Tag displays compact metadata that can optionally navigate to a related entity and/or be removed.

## When to use
Use Tags to represent linked entities, categories, filters, or contextual metadata throughout LegacyHQ.

## When not to use
Do not use Tags as primary actions or for long-form content.

## Design intent
Provide a compact, recognizable representation of an entity while supporting independent navigation and removal interactions. The leading and remove-button icons stay a constant 16px regardless of `size` - only the tag's height, padding, and the remove button's own container scale.

The hover/pressed background on the interactive content and remove-button areas fades in using the `fade-quick` semantic motion token, and every tone (including `default`, renamed from `standard`) now swaps a solid `background-color` between `neutral-subtle-default`/`hovered`/`pressed`, so the fade animates smoothly across all tones with no exceptions.

## Accessibility
Interactive areas must expose accessible names, support keyboard interaction, and maintain visible focus. Navigation and removal remain independent interactive targets.

## Related
Label, Badge, Link.
