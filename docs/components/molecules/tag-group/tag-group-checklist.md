# Tag Group Checklist

## Component Information

### Name
Tag Group

### Category
Molecule (see "Tier exception" in Notes below - its overflow panel composes an organism, Dropdown Menu)

### Related Components
- Tag (every visible tag and the overflow tag itself)
- Dropdown Menu (the overflow tag's floating panel)
- Menu (the overflow panel's content)
- Button Group (the equivalent composition for Buttons)

---

## Purpose

### What problem does this component solve?
Gives a wrapping row of Tags a ready-made overflow behavior - once the row exceeds `maxVisible`
tags, the rest collapse behind a "+N more" tag that opens a Dropdown Menu, instead of every consumer
wiring truncation-plus-panel by hand.

### Why does it need to exist?
Figma's `tab-group` component set (filed on the "Tag Group" page - a naming typo in Figma, verified
directly against the file) demonstrates exactly this: a wrapping row of ten `tag` instances plus an
eleventh `tag` reading "+5 more" nested inside a `dropdown-menu` instance. Code mirrors that real
structure as its own named component.

### What user goal does it support?
- See a bounded number of tags inline without the row growing unbounded
- Reach the rest via a single additional click, keyboard-accessible like any other Dropdown Menu
- Act on a truncated tag (navigate, remove, etc.) via `onOverflowTagSelect`

---

## Usage

### Where will this component be used?
Anywhere a list of tag-shaped references needs an inline cap - a task's linked entities, a record's
classifications, an active-filters row.

### What are the most common use cases?
- A bounded list of entity-reference tags on a record detail view
- An active-filters row that can grow past what comfortably fits on one line
- A short, unbounded tag list with no truncation at all (`maxVisible` omitted)

### When should this component NOT be used?
- A single tag - use Tag directly
- A group of Buttons - use Button Group

---

## Content

### What content can be displayed?
Whatever Tag can display, per item - `TagGroupItem` is Tag's own props (minus `size`/`children`/
`isInteractive`) plus a required `id` and a `label` (Tag's `children`).

### Does it render children?
No - `tags` is a data array (`TagGroupItem[]`), not `children`. Matches Menu's own `sections`
pattern rather than expecting hand-placed `<Tag>` elements.

---

## Variants

### Alignment
- left (default, matches Figma) - overflow tag trails the visible tags
- right - overflow tag leads the visible tags

Both values only ever affect render order, not which tags are visible or truncated.

### Size
- sm (default, matches Figma's own example) - applied uniformly to every tag, including the
  overflow tag
- md

### Token Mapping
None of its own beyond the root's wrapping-row `gap: var(--spacing-sm)` (matching Figma's measured
8px `itemSpacing`/`counterAxisSpacing`). Every other token is Tag's (tone/size) or Dropdown
Menu/Menu's (panel/row).

---

## States

Required:
- No overflow (tags.length <= maxVisible, or maxVisible omitted)
- Overflow, panel closed
- Overflow, panel open

Not required:
- Hover/active/focus/disabled at the Tag Group level - each Tag and the overflow panel own their
  own states independently.

---

## Accessibility

### Does this support keyboard navigation?
Yes, entirely inherited: each visible Tag's own keyboard behavior is unchanged; the overflow tag is
a real `<button>` (Tag's `isInteractive` form) so Enter/Space activation is native; arrow
keys/Home/End/Enter navigate the open overflow panel (Menu).

### What ARIA is applied?
`aria-expanded`/`aria-controls` on the overflow tag (Popup, via Dropdown Menu); `role="menu"` with
an accessible name (`overflowMenuAriaLabel`, default `${hiddenCount} more tags`) and per-row
`menuitem` on the panel (Menu).

### Is this an interactive component?
Partially - visible tags are interactive per their own props (navigational/removable/plain); the
overflow tag, when present, is always interactive (it must be, to open the panel).

---

## Responsive Behavior

### Mobile
The row wraps at any container width; the overflow panel inherits Popup's resize/scroll-driven
repositioning and touch-friendly outside-dismissal (`pointerdown`) identically to Dropdown Menu.

### Tablet
Same as desktop.

### Desktop
Same as Dropdown Menu - the panel's alignment falls back automatically near a viewport edge.

---

## Dependencies

### What components does this depend on?
Tag, Dropdown Menu, Menu (transitively, via Dropdown Menu). Dropdown Menu and Menu are organisms -
see "Tier exception" in Notes below.

### What components depend on it?
None yet.

---

## Notes

### Tier exception

Tag Group is classified as a molecule (originally built as an organism, then reclassified), but its
overflow panel composes Dropdown Menu directly - which is itself an organism (built from Menu +
Popup). CLAUDE.md's repo layout says molecules compose "from atoms/primitives" only, not organisms -
Tag Group is a deliberate, documented exception to that rule, not an oversight. The alternatives
considered and rejected:
- Re-implementing a lighter overflow panel directly on Popup (a primitive), skipping Menu/Dropdown
  Menu entirely - rejected because it would duplicate Menu's row/keyboard-navigation behavior inside
  Tag Group instead of reusing it.
- Reclassifying Dropdown Menu and Menu down to molecules too, so the dependency stays tier-pure -
  rejected as a larger, separate change affecting components Tag Group doesn't own.

Final implementation decisions:
- Figma's component set is literally named `tab-group`, not `tag-group` - a naming typo, verified
  directly against the file (filed on the "✅ Tag Group" page; all four variants are unambiguously
  rows of `tag` instances with a `tag`-triggered `dropdown-menu` for overflow, not tabs). Code follows
  the real structure under the correct name, `TagGroup`.
- Figma's variant grid crosses `size` (`sm (24)` / `md (32)`) with `alignment`, giving four variants -
  not the two originally recorded. `size` maps to `TagGroupProps.size` and applies uniformly to every
  visible tag and to the overflow tag, matching Figma exactly; `sm` is the default. Figma's own
  `alignment` axis additionally reports two auto-generated placeholder values (`alignment3` /
  `alignment4`) which are really the `size=md` row of `left`/`right` - the same class of authoring
  artifact as inline-message's `isOpen3`-`isOpen12`. Worth renaming in Figma.
- `maxVisible` is optional and unbounded when omitted - Figma's own example is a fixed illustrative
  count (10 visible + "+5 more"), adapted into an open, data-driven prop the same way Menu's own
  `sections` replaced Figma's per-variant row instances.
- `alignment` only changes where the overflow tag renders (leading vs. trailing) - it does not
  change which tags are visible or truncated, and it does not flip the nested Dropdown Menu's own
  panel alignment (measured as `left` in both Figma variants, hardcoded to Dropdown Menu's own
  default rather than recomputed).
- Tag Group calls `onOverflowTagSelect` on selection and does nothing else automatically - no
  navigation, no removal, no closing the panel - same "never assume" rule as Menu/Dropdown Menu.
- Tag's `isInteractive` prop was added specifically to give the overflow tag a real, keyboard
  operable trigger - see `tag.contract.json`'s `apiAdaptationNotes` and `tag-spec.md`. This is a
  Tag-level change with its own tests, not logic duplicated inside Tag Group.
- `tag-group.module.css` contains exactly one rule (the wrapping row + gap) - no component tokens of
  its own.
- `size` defaults to `sm` here (unlike Tag's own code default of `md`), matching Figma's own
  `tab-group` example exactly.
