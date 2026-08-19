# Tooltip

## Purpose
Tooltip provides concise contextual information about another element.

## When to use
Use to clarify icons, controls, or truncated content.

## When not to use
Do not place critical information or required actions inside a tooltip.

## Design intent
Tooltips are supplemental, non-interactive overlays triggered by hover or keyboard focus. There's no
arrow pointing at the trigger - it's a plain rounded rectangle, positioned by Popup to whichever
alignment actually fits the viewport (Tooltip always prefers `topCenter`).

Tooltip renders its content through [Popup](../../primitives/popup/popup.md) with `unstyled` set -
Popup owns positioning, the portal, and the mount fade-in (`fade-quick`); Tooltip owns only its own
visual skin (a small dark pill) and its hover/focus/blur/Escape-driven show/hide timing, which
predates Popup and stays independent of Popup's own (unused, here) dismissal behavior. There is
currently no matching fade-out: React removes the node immediately when it hides, so exit is
instant. Animating the exit would require deferring unmount until the animation finishes, which is a
behavior change beyond what this pass covers.

## Accessibility
Appear on hover and focus, are announced appropriately, and never receive focus themselves.

## Related
Popup, Icon Button, Toggle Icon Button, Button.
