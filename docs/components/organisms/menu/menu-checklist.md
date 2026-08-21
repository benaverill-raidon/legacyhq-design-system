# Menu Checklist

## Component Information

### Name
Menu

### Category
Organism

### Related Components
- Popup (the floating-panel primitive Dropdown Menu renders Menu through)
- Dropdown Menu (a trigger paired with a Menu panel, via Popup)
- TextField (composed directly for the search field)
- IconButton, Spinner (composed for the search clear button and loading row)

---

## Purpose

### What problem does this component solve?
Gives Dropdown Menu (and any other floating or embedded action/option list) a shared, data-driven
list implementation - search filtering, sectioning, selection styling, and roving-tabindex keyboard
navigation - instead of each consumer hand-rolling row markup and ARIA independently.

### Why does it need to exist?
Dropdown Menu's Figma component set literally instantiates the `menu` component as its panel
content - the two are meant to be built together, and Menu is the reusable half (also usable
standalone, per its own Figma description: "can be used anywhere").

### What user goal does it support?
- Scan a list of actions or options, optionally narrowed by typing
- Understand which item(s) are currently selected/checked at a glance
- Navigate and activate items by keyboard as well as pointer

---

## Usage

### Where will this component be used?
- Dropdown Menu's floating panel content
- Any standalone embedded list of actions/options (a sidebar, a card)

### What are the most common use cases?
- A "..." actions menu (rename/duplicate/archive/delete)
- A view-options menu with checkbox-style multi-select rows
- A sort-by menu with radio-style single-select rows

### When should this component NOT be used?
- As a floating panel by itself - it has no positioning/dismissal logic; pair with Popup or use
  Dropdown Menu
- A persistent, route-based navigation list with active-route highlighting

---

## Content

### What content can be displayed?
Each `MenuItem`: a required `label`, optional `description`, optional decorative
`leadingElement`/`titleLeadingElement`/`trailingElement`. Sections carry an optional `heading` with
an optional `headingLeadingElement`.

### Does it render children?
No - `sections` is a data prop (`MenuSection[]`), not `<Menu.Item>` children.

---

## Variants

### Size
- sm (192px, default, matches Figma)
- md (240px)
- lg (288px)

Width only - row height always follows content, at any size.

### Selection (per item, not a menu-level variant)
- Plain action item: no `selected`/`selectionType`
- Checkbox-style: `selectionType: 'checkbox'` + `selected`
- Radio-style: `selectionType: 'radio'` + `selected`

### Token Mapping
- Width: `--component-menu-width-sm` / `-md` / `-lg`
- Label text: `--color-content-default`; description: `--color-content-subtle`
- Hover background: `--color-background-neutral-overlay-hovered`
- Press background: `--color-background-neutral-overlay-pressed`
- Selected background: `--color-background-brand-primary-subtle-default` (+ `-hovered`/`-pressed`
  on interaction); selected text: `--color-content-brand-primary-default`
- Disabled text: `--color-content-disabled`
- Divider: `--color-border-default`
- Row spacing: `--spacing-sm` gap, `--spacing-md` inline padding, `--spacing-xs` block padding
- Label typography: `--typography-body-md-*`; description/heading: `--typography-body-sm-*`

---

## States

Required:
- Default, hover, press, focus (native button states)
- Selected (independent of hover/press/focus)
- Disabled
- Loading (menu-level - replaces sections with a loading row)
- Empty (search filtered out every item)

Not required:
- A distinct "checked" visual beyond the shared selected treatment - `selectionType` changes ARIA
  role/`aria-checked` only, not the visual styling, which stays the same `selected` treatment either
  way.

---

## Accessibility

### Does this support keyboard navigation?
Yes - `ArrowDown`/`ArrowUp` move a roving `tabIndex` between enabled, visible items (wrapping);
`Home`/`End` jump to the first/last; `Enter`/`Space` activate the focused item natively. A disabled
item is excluded from the cycle entirely.

### What ARIA is applied?
`role="menu"` on the sections container; each row is `menuitem` by default, or
`menuitemcheckbox`/`menuitemradio` (with `aria-checked`) when `selectionType` is set. Exactly one
enabled row carries `tabIndex={0}` at a time; the rest are `-1`. No default accessible name for the
menu role - pass `aria-label`/`aria-labelledby`.

### Is this an interactive component?
Yes - every row is a real, clickable/focusable `<button>`.

---

## Responsive Behavior

### Mobile
No difference - sizing is a fixed per-`size` width, not viewport-responsive.

### Tablet
Same as desktop.

### Desktop
Same as mobile/tablet.

---

## Dependencies

### What components does this depend on?
TextField (search field), IconButton (search clear button), Spinner (loading row), Focus Ring
primitive (row focus treatment).

### What components depend on it?
Dropdown Menu (renders Menu as Popup's panel content).

---

## Notes

Final implementation decisions:
- `sections` is required; an empty array renders a structurally valid, empty menu rather than being
  refused.
- Search filtering is controlled and string-only - non-string `label`/`description` content is
  never treated as a mismatch, only ever kept visible.
- Selection is per-item (`selected`/`selectionType`), not a menu-level mode, so one Menu can mix
  plain action rows with a selectable group.
- `leadingElement`/`trailingElement` must stay decorative-only - documented explicitly after an
  early draft nested a real `Checkbox`/`Radio` there and hit invalid-HTML nesting (an `<input>`
  inside the row's own `<button>`).
- Menu never manages open/close state or assumes it's inside a Dropdown Menu - `onSelect` is its
  only signal back to the consumer.
- `showScrollbar` maps to native `overflow-y`, not Figma's decorative custom scrollbar-thumb
  graphic - a deliberate scope simplification, tracked in `knownLimitations`.
- Roving-tabindex active id is derived on every render, not synced via a `useEffect` (avoids
  `react-hooks/set-state-in-effect` and the cascading-render risk it flags).
