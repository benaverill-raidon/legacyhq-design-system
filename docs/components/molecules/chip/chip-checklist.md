# Chip Checklist

## Component Information

### Name
Chip

### Category
Molecule (see "Tier exception" below - `mode="filter"` composes Dropdown Menu, an organism)

### Related Components
- Tag (the plain, non-removable label Chip should not replace)
- Tag Group (a truncating group of tags)
- Dropdown Menu / Menu (the operator and value panels)
- Toggle Button (the same `aria-pressed` selection semantics `scope` uses)
- Split Button (the same segmented-pill construction)
- Avatar / Avatar Group (common `valuePreview` content)

---

## Purpose

### What problem does this component solve?
Three closely-related jobs share one visual language and one size scale, and were previously
unbuilt: showing/editing an active filter, showing an applied property, and selecting a search
scope. Building them as one component keeps the pill construction, border treatment, and token
mapping in one place instead of three.

### What user goal does it support?
- See at a glance which filters are applied, and change one in place without reopening a filter panel
- Remove an applied filter or property in one click
- Narrow a search to a broader category before typing

---

## Usage

### Where will this component be used?
- Filter bars above task lists and matter lists (`filter`)
- Record detail views showing applied properties (`property`)
- Search interfaces, scoping before or during a query (`scope`)

### When should this component NOT be used?
- A plain, non-removable label - use Tag
- A group needing overflow truncation - use Tag Group
- A primary action - use Button, or Split Button when it has close alternatives
- A persistent on/off setting - use Switch; a bordered text toggle - use Toggle Button

---

## Content

### What content can be displayed?
A label (property or scope name), an optional decorative `elemBefore`, and - in `filter` mode - an
optional operator, a required value, and an optional decorative `valuePreview`. Operator and value
each take a `MenuSection[]`, the same shape Menu and Dropdown Menu already use.

---

## Variants

### Mode
- `filter` - label + optional operator + value + remove
- `property` - label + remove
- `scope` - label only, selectable

### Size
- `sm` (24px), `md` (32px, default)

### Token Mapping
No new tokens. Segments use `color-background-neutral-subtle-default/hover/press` on
`color-border-input`; the label is `color-content-subtle`, operator/value `color-content-default`;
selected uses the `selected` family (`color-background-selected-default-default/hover/press`,
`color-border-selected`, `color-content-selected`); disabled uses `color-background-disabled` /
`color-content-disabled`. Geometry uses `size-control-xs/sm`, `measurement-6`, `spacing-sm/xs`,
`border-width-sm`, `border-radius-full-round`, and `size-200` for the 16px slots.

---

## States

Required:
- Default, focus, disabled (every mode)
- Hover and press on the **interactive segments only** - operator, value, remove
- Selected (`scope` only)

Not required:
- Hover or press on the label segment (chip-base) in any mode. Figma models a state axis there, but
  the label is a passive span in filter/property, and in scope the selected/unselected distinction is
  the feedback. Deliberate product decision.
- A blended selected+disabled treatment - Figma models no selected+disabled chip-base variant, so
  disabled fully overrides selected.

---

## Accessibility

### Does this support keyboard navigation?
Yes, entirely inherited. Every control is a native `<button>`: Tab moves between them in DOM order,
Enter/Space activates, Escape closes an open panel (Popup), and arrow keys navigate panel rows (Menu).

### What ARIA is applied?
`aria-pressed` on a `scope` chip; `aria-expanded`/`aria-controls` on dropdown segments (from Popup);
`role="menu"` with an accessible name on each panel; an accessible name on the remove button;
`aria-hidden` on `elemBefore` and `valuePreview`.

### Is this an interactive component?
Yes, but which parts are interactive depends on the mode - in `filter`/`property` the label segment is
a plain span, not a control.

---

## Dependencies

### What components does this depend on?
Dropdown Menu (and Menu transitively), Focus Ring, the generated `CloseIcon`.

### What components depend on it?
None yet.

---

## Notes

### Tier exception

Chip is a molecule, but `mode="filter"` composes Dropdown Menu directly, which is itself an organism
(Menu + Popup). This is the same deliberate, documented exception Tag Group, Avatar Group, and Split
Button already established (see their own `tierNote`s) - not re-derived here.

Final implementation decisions:
- **One `Chip` export, props as a discriminated union on `mode`.** The three modes differ
  structurally, so a single all-optional interface would let `<Chip mode="scope" sections={...} />`
  compile and silently do nothing. This is the first component in the system to use a discriminated
  union for its props; the alternative considered and rejected was three separate exports, which
  diverges from Figma's single component set and triples the public surface.
- **Figma's `filtering` is `filter` in code** - a noun, consistent with its sibling values `property`
  and `scope`. Same class of deliberate naming fix as `tab-group` -> `TagGroup`.
- **Figma's `filter type` axis is not modeled.** Its four values (status/context/assignee/due date)
  differ only in data, with one structural exception: `due date` has an operator segment. Code
  exposes that fact as an optional `operator` prop, so any filter can carry a comparison and a fifth
  product category never needs a code change. The four types are four stories instead.
- **Each dropdown segment owns its own open state**, matching Figma - the operator and value are two
  independent `dropdown-menu` instances with their own `isOpen`. One shared flag on Chip would make
  them fight.
- **`onRemove` is required for `filter` and `property`.** Every verified chip-level variant of both
  carries a remove button; chip-base's `isRemovable=false` variants exist only at the part level, and
  a non-removable label is Tag's job.
- **`scope` renders as a real toggle button with `aria-pressed`** - it is the only mode whose label
  segment is itself a control, and the only one Figma gives an unselected state.
- **Panel accessible names are composed** (`${label} operator` / `${label} value`) rather than taken
  from the segment label, which is the current value ("on", "March 2") and names a panel poorly.
- **`tone` is unexposed.** chip-base supports five tones but all 14 chip variants use
  `tone=default`, so a chip-level mapping would be extrapolated rather than verified.
- **The seam rule was generalized.** Figma suppresses only the leading segment's trailing stroke,
  which leaves a doubled 2px line wherever two middle segments meet - visible on its own `due date`
  filter. Code drops every segment's trailing border so each following segment's leading border draws
  the seam, giving a uniform 1px at every junction.
- **No interaction states on the label segment (chip-base), in any mode.** Figma models a
  hover/press/focus axis there; skipping it is a deliberate product decision. Interaction fills belong
  to the segments that act - operator, value, remove. Consequences: nothing in Chip consumes
  `--color-background-selected-default-hover`/`-press`, and `ChipScopeProps['data-force-state']`
  narrows to `'focus'` only so a hover/press value cannot silently no-op.
- **The label icon inherits the label colour** via the same `:global([data-color])` override Button
  uses, so it tracks subtle -> selected -> disabled with the text. Deliberately not applied to
  `valuePreview`, whose content (status colours, avatar images) carries real per-item meaning.
- **Focus ring stacking.** Every segment is `position: relative` and the focused one gets
  `z-index: 1` - the ring is an outline drawn outside the box and segments sit flush, so the next
  segment would otherwise paint over its trailing edge. Same paint-tier reasoning as Avatar Group's
  overlapping stack, applied to an outline rather than a fill.
- **The remove button has a "Remove" Tooltip**, suppressed while disabled ("Remove" on a chip that
  cannot be removed is misleading, not explanatory). The button's `aria-label` remains the accessible
  name, so the tooltip is never the sole one. `disabled` disables the remove button itself, so removal
  is impossible by pointer and keyboard alike.
- **Scope chips toggle independently.** Not a radio group - several can be on at once, and Chip never
  coordinates siblings. One-of-N belongs to the consumer, exactly as with Toggle Button.

### Bugs caught during live verification

- `.mode_scope .segment { color }` at (0,2,0) outweighed `.selected` at (0,1,0), so **selected scope
  chips silently rendered `content/subtle` text** instead of `content/selected`. The rule now sets
  only `cursor`; `.labelSegment` supplies the unselected color and `.selected` legitimately overrides
  it. Regression-guarded.
- Disabled did not reset `border-color`, so a **disabled selected chip kept the selected border**.
  Disabled now fully overrides selected. Regression-guarded.
- **The remove button detached from the pill when disabled** - rendering as its own fully-rounded,
  fully-bordered island with a gap. Cause: Tooltip wraps a *disabled* child in an extra `<span>` so
  pointer events still fire, and every segment rule here is structural (`:first-child`,
  `:last-child`, `:not(:last-child)`), so the wrapper stopped the button being a direct child of the
  root. Passing `disabled` to Tooltip suppresses only the popup, not the wrapper. Fixed by not
  mounting Tooltip at all when disabled. Regression-guarded by asserting every segment stays a direct
  child of the root in both states - the guard that generalizes, since **any** wrapper around **any**
  segment reintroduces this.
  - Process note: this was introduced by adding the Tooltip *after* the segment geometry had been
    verified in the browser, and not re-verifying afterwards. Geometry needs re-checking whenever the
    segment DOM changes, not just when the CSS does.

---

## Validated Figma Details

- `chip` component set: node `4631:83388`, file `Components v1.0.0`, page "✅⏲️ Chip". Four axes
  (`mode`, `size`, `filter type`, `isSelected`) but only **14 of 60** combinations exist.
- Parts: `chip-base` (`3662:7444`), `value` (`3662:25295`), `operator` (`3662:25209`),
  `remove-button` (`3662:25128`), `property-value` (`3661:41493`), `elemBefore` (`1978:50905`).
- Segment radii measured per side: leading `[999, 0, 0, 999]`, middle `[0, 0, 0, 0]`, trailing
  `[0, 999, 999, 0]`. Outer radius 999 on filtering/property.
- Heights 24 (sm) / 32 (md); padding-inline 6 / 8; remove-button padding-inline 4/6 and 6/8; gap 4.
- Per-side strokes: chip-base `[1, 0, 1, 1]`, every following segment all-1, `strokeAlign: INSIDE`.
- `value`'s trigger holds a `property-value` preview (type=avatar | avatar group | task status |
  primary link) plus the value text; `show-property` toggles the preview. Modeled in code as an open
  `valuePreview: React.ReactNode` slot rather than a closed enum.
- No selected+disabled chip-base variant exists.
- Each dropdown's surface slot is empty in the static file - the same "static mockup, real content is
  a code decision" pattern as Tag Group / Avatar Group / Split Button.

---

## Examples to document

- [ ] All three modes side by side
- [ ] A filter with an operator (due date)
- [ ] A filter with a `valuePreview` (assignee avatars)
- [ ] Both sizes across all three modes
- [ ] A live, selectable scope row
- [ ] A realistic, removable filter bar
- [ ] Long label/value truncation
- [ ] Dark surface
