# Tooltip

## Purpose
Tooltip provides concise contextual information about another element.

## When to use
Use to clarify icons, controls, or truncated content.

## When not to use
Do not place critical information or required actions inside a tooltip.

## Design intent
Tooltips are supplemental, non-interactive overlays triggered by hover or keyboard focus. There's no
arrow pointing at the trigger - it's a plain rounded rectangle, positioned to whichever side of the
trigger actually fits the viewport.

The tooltip fades in on mount using the `fade-quick` semantic motion token via a CSS `@keyframes`
animation (not `transition`, since the element mounts/unmounts rather than toggling a class). There
is currently no matching fade-out: React removes the node immediately when it hides, so exit is
instant. Animating the exit would require deferring unmount until the animation finishes, which is a
behavior change beyond what this pass covers.

## Accessibility
Appear on hover and focus, are announced appropriately, and never receive focus themselves.

## Related
Icon Button, Toggle Icon Button, Button.
