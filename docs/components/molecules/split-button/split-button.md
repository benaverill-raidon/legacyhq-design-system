# Split Button

## Purpose
A split button lets people perform an action, or choose from a small group of similar actions. It
joins a primary `Button` with a caret-only `IconButton` that opens a `Dropdown Menu` of related
alternatives, reading as one continuous shape rather than two separate controls.

## When to use
Use Split Button for a primary action that has a small number of closely related alternatives -
"Save" with "Save as..." / "Save a copy", "Send for signature" with "Send as draft" / "Preview
before sending".

## When not to use
Do not use Split Button for a single action with no alternatives - use Button directly. Do not use
it for an icon-only trigger with no separate primary action - compose Icon Button with Dropdown
Menu directly instead; Split Button always has a labeled primary segment. Do not use it for more
than a small group of similar actions, or actions unrelated to the primary one - use Dropdown Menu
on its own, or Button Group, instead.

## Design intent
Split Button is a thin composition, the same philosophy as Tag Group and Avatar Group: a real
`Button` (the primary action) and a real `IconButton` (the secondary, caret-only action) joined by
a 1px divider, with the secondary segment wrapped in a `Dropdown Menu`. Every visible pixel is
Button's, IconButton's, or Dropdown Menu/Menu's own, aside from the divider itself and the squared
inner corners that make the two segments read as one continuous shape.

The real Figma source (`split-button`, correctly named) is filed on the file's own "✅⏲️ Split
Button" page: 24 variants crossing `tone` (default/primary - code calls this `appearance`, the same
Figma-vs-code naming divergence Button's own `tone`/`appearance` split already has), `size`
(xs/sm/md/lg, matching Button's own four sizes exactly), `isDisabled`, and `isOpen` (never crossed
with `isDisabled` - a disabled split button can't be open). Notably, Figma's own reference instance
uses a raw `popup` instance for the open panel, not a `dropdown-menu` instance - but the panel's own
purpose ("choose from a small group of similar actions") is exactly Dropdown Menu's own established
use case, so code reuses Dropdown Menu directly rather than hand-assembling Popup and Menu a second
time. This mirrors Tag Group and Avatar Group's own precedent exactly, including the same
molecule-composing-an-organism tier exception.

The primary action's trailing corners and the secondary action's leading corners are squared off
(measured directly: `topLeft`/`bottomLeft`: 12, `topRight`/`bottomRight`: 0 on the button at
`size=lg`, the exact mirror on the secondary action) so the divider sits flush between two segments
that read as one shape, not squeezed between two independently-rounded pills.

`appearance` is deliberately narrower than Button's own - only `'default' | 'primary'`, matching
every verified Figma variant exactly. Figma never shows a `'subtle'` split button, so code doesn't
invent one.

## Accessibility
Inherited from Button (the primary action's own semantics) and Icon Button/Dropdown Menu/Menu (the
secondary action's `aria-expanded`/`aria-controls`, tooltip, and the panel's `role="menu"` with
`menuitem` rows). `secondaryActionLabel` is required, since the caret segment has no visible text of
its own to derive an accessible name from - it also becomes that segment's tooltip, via IconButton's
own existing "explicit `aria-label` shows a matching tooltip automatically" behavior.

## Related
Button (the primary action), Icon Button (the secondary action), Dropdown Menu (the secondary
action's floating panel), Menu (the panel's content), Tag Group and Avatar Group (the same
composition pattern, applied to a different overflow shape).
