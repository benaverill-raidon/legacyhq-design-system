# Spinner

## Purpose
Spinner communicates that an operation is in progress.

## When to use
Use for indeterminate loading.

## When not to use
Use Progress Indicator for measurable progress.

## Design intent
Provide a lightweight, consistent loading indicator. Spinner has no color of its own - it always
inherits the current text color of whatever it's placed inside (a Button's per-appearance/tone
color, a colored heading, plain body text), rather than a fixed token.

## Accessibility
Announce loading when appropriate.

## Related
Button, Progress Indicator.
