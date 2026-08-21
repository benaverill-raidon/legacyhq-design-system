# Dropdown Menu

## Purpose
Dropdown Menu pairs any trigger element with a floating Menu panel, positioned and dismissed via
Popup. It has no behavior of its own beyond that composition.

## When to use
Use Dropdown Menu for a click-to-open action menu anchored to a button, icon button, avatar, tag,
chip, or any other trigger - matching Figma's own `dropdown-menu` component, which always pairs a
trigger with a `menu` instance.

## When not to use
Do not reach for Dropdown Menu for a non-interactive hover hint - use Tooltip. Do not reach for it
for floating content that isn't a list of actions/options - Dropdown Menu always renders a Menu;
use Popup directly with your own `content` for anything else (a confirmation, a status message).

## Design intent
Dropdown Menu is deliberately thin. Positioning, dismissal, and the trigger's ARIA relationship come
entirely from Popup; search, sectioning, selection, and keyboard navigation come entirely from Menu.
The only thing Dropdown Menu adds is a fixed, always-opens-below alignment vocabulary
(`'left' | 'center' | 'right'`, mapped to Popup's `bottomLeft`/`bottomCenter`/`bottomRight`) and the
specific pairing of `padding="none"` on Popup with Menu as its content - matching Figma's own
`dropdown-menu` component exactly, whose nested `menu` instance measures zero outer padding (Menu's
own search field and rows already carry their own insets).

`DropdownMenuProps` extends `MenuProps` directly (minus `id`/`className`, which apply to Popup's
panel instead) rather than exposing an opaque `content` prop the way Popup does - every real Figma
instance of `dropdown-menu` nests a `menu` specifically, never arbitrary content, so passing Menu's
own props straight through is a more accurate, more convenient match for that reality than requiring
a consumer to hand-construct a `<Menu>` every time.

Figma's `trigger` variant enumerates nine example trigger types (button, icon-button, avatar,
link-button, several chip variants, tag, a page selector) - none of them became a variant prop.
`children` stays a generic `React.ReactElement`, matching Popup's own `children` model, so any
focusable element works as a trigger without Dropdown Menu maintaining a closed list of "supported"
trigger shapes.

Like Menu, Dropdown Menu never closes itself on selection - `onSelect` on a Menu item is the only
signal available, and a consumer wanting a selection to close the dropdown wires
`onOpenChange(false)` from there.

## Accessibility
Inherited entirely from Popup (trigger `aria-expanded`/`aria-controls`) and Menu (`role="menu"`,
per-item `menuitem`/`menuitemcheckbox`/`menuitemradio`, roving-tabindex keyboard navigation). Pass
`aria-label` or `aria-labelledby` - forwarded to Menu, which sets no default accessible name for the
menu role.

## Related
Popup (the floating-panel primitive underneath, used with `padding="none"`), Menu (the panel
content, every one of its own props forwarded through).
