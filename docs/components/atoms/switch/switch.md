# Switch

## Purpose
A Switch allows users to immediately toggle a setting between enabled and disabled.

## When to use
Use for binary settings that take effect immediately.

## When not to use
Do not use when users must choose from multiple options or confirm before applying changes.

## Design intent
Provide a familiar, accessible toggle with clear on/off states and consistent motion. `isLoading`
blocks toggling and announces `aria-busy`, while staying focusable (unlike `disabled`) and replacing
the visible on/off mark with a small Spinner that inherits the mark's own color.

## Accessibility
Use native switch/checkbox semantics, visible focus, and an associated label.

## Related
Checkbox, Radio.
