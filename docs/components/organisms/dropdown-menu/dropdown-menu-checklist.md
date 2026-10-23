# Dropdown Menu Checklist

## Component Information

### Name
Dropdown Menu

### Tier
Organism

### Related Components
- Popup (the floating-panel primitive underneath, used with `padding="none"`)
- Menu (the panel content - every one of its own props is forwarded through unchanged)

---

## Purpose

### What problem does this component solve?
Gives a click-to-open action menu a ready-made composition of Popup (positioning/dismissal) and
Menu (content) instead of every consumer wiring that pairing - and the `padding="none"` detail it
requires - by hand.

### Why does it need to exist?
Figma's `dropdown-menu` component set literally instantiates `popup` wrapping a `menu` for every one
of its 35 variants. Code mirrors that exact pairing as its own named component rather than leaving
consumers to discover and reproduce the composition themselves.

### What user goal does it support?
- Open a menu of actions/options from any trigger with a click
- Dismiss it via Escape, an outside click, or (if wired) selecting an item
- Navigate and select via keyboard, identical to Menu on its own

---

## Usage

### Where will this component be used?
Any button, icon button, avatar, tag, or chip that needs an attached action menu - row "..." menus,
account menus, filter/sort menus, and similar.

### What are the most common use cases?
- A row-level "..." actions menu (icon-button trigger)
- An account/profile menu (avatar trigger)
- A filter or sort menu with a text button trigger

### When should this component NOT be used?
- A non-interactive hover hint - use Tooltip
- Floating content that isn't Menu-shaped (a confirmation, a status message) - use Popup directly

---

## Content

### What content can be displayed?
Whatever Menu can display - `DropdownMenuProps` extends `MenuProps` directly (minus `id`/
`className`), so `sections`, search, loading, and empty-state content all pass straight through.

### Does it render children?
Yes - `children` is the single trigger element, exactly like Popup.

---

## Variants

### Alignment
- start (default, Figma's `left`) - opens below, start (left) edges aligned
- center - opens below, horizontally centered
- end (Figma's `right`) - opens below, end (right) edges aligned
- The deprecated `left` and `right` still work and place the same as `start` and `end`

All three only ever set Popup's *preferred* alignment - Popup's own viewport-fit fallback still
applies if it overflows.

### Token Mapping
None of its own - every token is Popup's (background/border/radius/shadow) or Menu's (row/section/
selection colors, spacing, typography, per-size width). See their respective checklists.

---

## States

Required:
- Closed (default)
- Open

Not required:
- Hover/active/loading at the DropdownMenu level - the trigger and Menu each own their own states.

---

## Accessibility

### Does this support keyboard navigation?
Yes, entirely inherited: Escape dismisses (Popup); arrow keys/Home/End/Enter/Space navigate and
activate items (Menu).

### What ARIA is applied?
`aria-expanded`/`aria-controls` on the trigger (Popup); `role="menu"` and per-item
`menuitem`/`menuitemcheckbox`/`menuitemradio` roles with roving `tabIndex` (Menu). DropdownMenu sets
no `role` on Popup's panel itself.

### Is this an interactive component?
Yes - the trigger and every Menu row are real interactive controls.

---

## Responsive Behavior

### Mobile
Identical to Popup - repositioning recalculates on resize/scroll; outside-dismissal uses
`pointerdown`, which fires for touch.

### Tablet
Same as desktop.

### Desktop
Alignment falls back automatically near a viewport edge, inherited from Popup.

---

## Dependencies

### What components does this depend on?
Popup, Menu.

### What components depend on it?
None yet.

---

## Notes

Final implementation decisions:
- No `content` prop like Popup's - DropdownMenu always renders a Menu, matching every real Figma
  instance of `dropdown-menu`, which never nests anything else.
- `alignment` is restricted to the three values Figma's `dropdown-menu` actually has
  (`left`/`center`/`right`, named `start`/`center`/`end` in code), always mapped to a `bottom*`
  Popup alignment - not the full six-value
  `PopupAlignment` space.
- No `dropdown-menu.module.css` - there is no visual styling that belongs to DropdownMenu itself.
- DropdownMenu holds no `useState`; it keeps a trigger ref and runs the menu-button focus
  management while open (focus into the panel on open; back to the trigger on choose, Escape, and
  Tab out).
- Choosing an item closes the panel (after the item's `onSelect`) unless that `onSelect` calls
  `event.preventDefault()`; a `role="combobox"` trigger (Select) is left to close it itself.
- The trigger gets `aria-haspopup="menu"` unless it sets its own.
- The Docs page lists the props inherited from Menu through `Omit<MenuProps, 'id' | 'className'>`
  by hand: react-docgen doesn't read props inherited from another file.
