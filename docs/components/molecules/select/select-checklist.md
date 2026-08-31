# Select Checklist

## Component Information

### Name
Select

### Category
Molecule (see "Tier exception" below — its panel composes Dropdown Menu, an organism)

### Related Components
- TextField (the trigger frame)
- Chip (multi-select values)
- Dropdown Menu / Menu (the option panel)
- Radio (the right choice for a short, fixed, exclusive set)
- Popup (positioning)

---

## Purpose

### What problem does this component solve?
Choosing from a medium-to-long list of values, with type-to-filter, in a field-styled trigger —
single or multiple, the latter shown as removable chips.

### Why does it need to exist?
A native `<select>` doesn't filter, doesn't do multi-select chips, and can't be styled to the system.
Figma has a full `select` component set (84 variants) modelling exactly this.

### What user goal does it support?
- Find and pick a value quickly by typing
- Pick several values and see/remove them inline

---

## Usage

### Where will this component be used?
Forms and filter surfaces — status pickers, assignee pickers, matter-type pickers.

### When should this component NOT be used?
- A short, always-visible exclusive set — Radio
- A binary — Switch/Checkbox
- Free text with no fixed options — TextField
- A menu of actions — Dropdown Menu directly

---

## Content

### What content can be displayed?
`options: SelectOption[]` — `{ value, label, icon?, description?, disabled?, group? }`. Select maps
these into the Menu; grouping is automatic from `group`.

---

## Variants

### inputType
- `single` (default) — scalar value, radio rows, chosen label in the trigger
- `multi` — array value, checkbox rows, removable chips in the trigger

### Size
- `sm` (32), `md` (40, default), `lg` (48)

### Tone
- `default` (bordered), `subtle` (bottom-border only) — maps to TextField's `appearance`

### Token Mapping
No new tokens. The trigger reuses TextField's frame tokens, chips reuse Chip's, the panel reuses
Dropdown Menu/Menu's. `select.module.css` references only `--fade-quick` (caret rotation).

---

## States

Required:
- default, hover, focus, typing, hasValue, invalid, disabled

Not required:
- A combined open+disabled — a disabled Select can't open.

---

## Accessibility

### Does this support keyboard navigation?
Yes. Type to filter; ArrowDown opens/moves into the menu; Enter/arrows/Home/End navigate rows
(Menu's own); Backspace removes the last chip (multi, empty query); Escape closes and returns focus
to the input.

### What ARIA is applied?
`role="combobox"` + `aria-haspopup="menu"` + `aria-autocomplete="list"` on the input;
`aria-expanded`/`aria-controls` from Popup; `menuitemradio`/`menuitemcheckbox` + `aria-checked` on
rows; `aria-invalid` when invalid.

### Is this an interactive component?
Yes — a real focusable text input opening a menu.

---

## Dependencies

### What components does this depend on?
TextField (+ its new `leadingContent` slot), Chip, Dropdown Menu (and Menu, Popup transitively),
CaretDownIcon.

### What components depend on it?
None yet.

---

## Notes

### Tier exception
Select is a molecule, but its panel composes Dropdown Menu directly, which is an organism (Menu +
Popup). Same deliberate, documented exception Tag Group, Avatar Group, Split Button, and Chip
established. Not re-derived here.

Final implementation decisions:
- **Discriminated union on `inputType`** (default `single`) — single's scalar value and multi's
  array can't be mixed, the same pattern Chip uses for `mode`.
- **Flat `SelectOption[]`, not `MenuSection[]`.** Select maps options into Menu rows itself, owning
  selection, radio/checkbox semantics, and typeahead — the ergonomic shape a Select consumer expects.
  Grouping is automatic from each option's `group` field.
- **Trigger reuses TextField**, whose tokens/geometry match Figma's `select-trigger` token-for-token.
  `tone` maps to TextField's `appearance`.
- **TextField gained one additive prop, `leadingContent`** — an in-frame slot (before the input, not
  aria-hidden) so multi-select chips render inside the field without a second frame or duplicated
  state CSS. Shrinks/clips to keep the field single-line (Figma's trigger is NO_WRAP). Same move as
  Tag's `isInteractive`; existing TextField usage unchanged.
- **Menu a11y pattern, not a strict listbox** — matches Figma's text-input + dropdown-menu
  composition and reuses Menu wholesale. Trade-offs (screen readers say "menu"; focus moves into the
  panel on ArrowDown) recorded as known limitations.
- **Removable two ways** in multi — chip ✕ and menu re-pick — plus Backspace on an empty query.
  Figma's `isRemovable=false` on chip-base is the static mockup state.
- **Typeahead is the trigger input**, chosen over Menu's own built-in search box; `showSearch=false`
  on the inner Menu, Select passes pre-filtered sections. A controlled `searchValue`/`onSearchChange`
  hands filtering to the caller.

### Panel width match verified live
The panel matches the field frame's width and left edge exactly (single and multi). The input keeps
the merged ref + `aria-expanded`/`aria-controls`; Select additionally passes the frame (the input's
`parentElement`) as Dropdown Menu's `anchorRef` and sets `matchTriggerWidth`, so Popup measures /
positions / width-matches / dismiss-bounds against the frame and the inner Menu fills it via
`fullWidth`. Measured live: frame and panel both 280px @ left 32 (single), 480px @ left 32 (multi) —
no ~9px inset.

---

## Validated Figma Details

- `select` component set: node `4662:42012`, page "✅⏲️ Select". 84 variants across size, tone, state
  (default/hover/focus/typing/hasValue), inputType, isInvalid, isDisabled.
- `select-trigger` part `4658:67775` is a `text-field` instance + trailing `caret_down`
  (`1496:1775` = CaretDownIcon). Trigger tokens/geometry match the TextField molecule exactly.
- Trigger geometry: sm 32/r8, md 40/r8, lg 48/r12; fill `elevation/surface/raised/default`→`/hover`,
  border `border/input`→`border/focused` (focus/typing), disabled `background/disabled` +
  `border/disabled`.
- Multi trigger is single-line, NO_WRAP at every size; chips inline, `chip-base` mode=select, sm
  chips in sm/md triggers and md in lg.
- The panel's surface slot is the empty generic `panelSurface` in the static file — the option list
  is a code decision, the same pattern as every other dropdown-menu-based molecule.

---

## Examples to document

- [ ] Single vs multi side by side
- [ ] Typeahead filtering + empty message
- [ ] Grouped options
- [ ] All sizes and both tones
- [ ] Invalid and disabled (single + multi)
- [ ] A realistic form row with option icons
- [ ] Many chips on one line
- [ ] A disabled option
- [ ] Dark surface
