# Menu

## Purpose
Menu renders a searchable, sectioned list of interactive rows. It has no background, border, or
shadow of its own - it's pure content, meant to sit inside a surface a consumer supplies (Popup's
own skin for Dropdown Menu, or a card/sidebar for a standalone list).

## When to use
Use Menu as the content of a Dropdown Menu's floating panel, or as a standalone list of actions or
options embedded in a surface you already control (a sidebar, a card). It's data-driven - pass a
`sections` array, not `<Menu.Item>` children.

## When not to use
Do not reach for Menu as a floating panel by itself - it has no positioning or dismissal logic; pair
it with Popup directly, or use Dropdown Menu. Do not use it as a persistent navigation list with
route-based active-state highlighting - its selection model (`selected`/`selectionType` per item) is
transient and action-oriented, not a navigation concept.

## Design intent
Menu inverts Figma's per-variant component-set structure into a plain data shape: a `sections` prop
(`{ id, heading?, items }[]`), each item a `MenuItem` object rather than a manually-composed
component instance. This is what lets a real list of N items render from data instead of N
hand-placed rows.

Every row is a real `<button role="menuitem">` (or `menuitemcheckbox`/`menuitemradio` when the item
sets `selectionType`) - not a styled `<div>` - so Enter/Space activation and the native
`:disabled`/`disabled` attribute come for free. This is also why `leadingElement`/`trailingElement`
are documented as decorative-only: nesting a real `Checkbox`/`Radio`/`Button` inside the row would
put a focusable control inside another one, which is invalid HTML. The selected/checked visual and
ARIA state is carried entirely by the row's own `selected`/`selectionType`, independent of whatever
(if anything) is rendered in those slots.

Selection is per-item, not a menu-level mode - a single Menu can mix plain action rows with a
checkbox- or radio-style selectable group, since each `MenuItem` independently opts in.

Keyboard navigation (ArrowUp/Down/Home/End, roving `tabIndex`) has no Figma variant at all - it's a
code-level accessibility decision fulfilling Popup's own documented future enhancement ("a
documented recipe for wiring keyboard arrow navigation once Dropdown Menu exists").

Menu never closes anything and never assumes it's inside a Dropdown Menu - `onSelect` is the only
signal it gives back. A consumer wanting a selection to close a containing Dropdown Menu wires that
from the item's own `onSelect`.

## Accessibility
The sections container carries `role="menu"`; each row is `menuitem` by default, or
`menuitemcheckbox`/`menuitemradio` (with `aria-checked` reflecting `selected`) when the item sets
`selectionType`. Exactly one enabled, visible row has `tabIndex={0}` at a time (roving tabindex); the
rest are `-1`, and a disabled row is excluded from the cycle entirely. Pass `aria-label` or
`aria-labelledby` - Menu sets no default accessible name for the menu role.

## Related
Popup (the floating-panel primitive Dropdown Menu renders Menu through), Dropdown Menu (a trigger
paired with a Menu panel), TextField (composed directly for the search field).
