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

`showIcons` (default `true`) toggles only the decorative check/X marks drawn inside the track -
`false` renders a bare track/thumb. It's independent of `isLoading`: the Spinner is a functional
status signal, not decoration, so it still renders in the same slot even with `showIcons={false}`.

The track color fade uses the `fade-quick` semantic motion token; the thumb slide uses `move-quick`
(the spring-eased motion token), since it's the one animation in the system that's an actual physical
reposition rather than a color change. The thumb also expands slightly (`scaleX(1.16)`) on hover as
well as press - triggering on hover lets the cue start as soon as the pointer arrives, a beat before
an actual click.

## Accessibility
Use native switch/checkbox semantics, visible focus, and an associated label.

## Related
Checkbox, Radio.
