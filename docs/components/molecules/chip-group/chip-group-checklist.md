# Chip Group Checklist

## Component Information

### Name
Chip Group

### Category
Molecule (no tier exception - it composes only Chip and renders a plain `div`)

### Related Components
- Chip (what the group lays out)
- Tag Group (the truncating equivalent, with Tags)
- Button Group (the same children-based layout-wrapper shape)
- Avatar Group (a group that *does* own its items, because it truncates)

---

## Purpose

### What problem does this component solve?
Chips almost never appear alone - they appear as a scope selector or a filter bar. Chip Group puts
that row's measured wrap, gap, and alignment in one place, and removes the need to repeat `size` on
every chip.

### Why does it need to exist?
Chip's own contract already listed it as a future enhancement, and Figma has a dedicated `chip-group`
component set. The practical driver is size: in a *wrapping* row, one chip left at the wrong size
visibly breaks the line it lands on, and repeating `size="sm"` six times is exactly how that happens.

### What user goal does it support?
- Scan and toggle a set of search scopes
- See every active filter at once, and remove any of them

---

## Usage

### Where will this component be used?
- Scope selectors above search results
- Active filter bars above task lists and matter lists

### When should this component NOT be used?
- When the collection must truncate behind a "+N more" affordance - use Tag Group, with Tags
- For a row of buttons - use Button Group
- To decide which chips are selected - Chip Group is layout, not state

---

## Content

### What content can be displayed?
`children` - Chips. Any element is accepted, but the layout is built for Chip.

---

## Variants

### Alignment
- `left` (default) - chips pack against the inline start
- `right` - chips pack against the inline end

### Size
- `sm`, `md` - shared with every Chip inside; unset by default

### Token Mapping
Exactly one token: `gap: var(--spacing-sm)`, matching Figma's measured itemSpacing 8 and
counterAxisSpacing 8. No colour, padding, border, or radius - the group is pure layout.

---

## States

Required:
- Default only. Chip Group renders no interactive element of its own, so it has no states.

---

## Accessibility Requirements

- [ ] `role="group"` only when `aria-label`/`aria-labelledby` is provided - never an unnamed group.
- [ ] No roving tabindex: the chips are independent controls, not one composite widget.
- [ ] No focus or keyboard behaviour of its own.
- [ ] Forwards a ref and passes native div attributes through.

---

## Dependencies

### What components does this depend on?
Chip (and `ChipSizeContext`, which lives with Chip).

### What components depend on it?
None yet.

---

## Notes

Final implementation decisions:
- **`children`, not a data array.** Tag Group and Avatar Group own their items because they decide
  which are visible vs truncated. Chip Group has no overflow, and Chip's props are a discriminated
  union on `mode` that a flat item type could not express without duplicating the whole union. Button
  Group - the closest analogue here - is likewise a children-based layout wrapper.
- **`size` shared via React context, not `cloneElement`.** Cloning only reaches direct children, so a
  Chip inside a Tooltip, from a `.map`, or behind a conditional would silently miss the group's size -
  the same structural fragility that detached Chip's own remove button from its pill. Context reaches
  any descendant. An explicit per-Chip `size` still wins (`size ?? groupSize ?? 'md'`), and the
  provider is only mounted when `size` is actually set, so an unset group overrides nothing.
- **The context lives with Chip**, not with Chip Group, so Chip can consume it without importing its
  own group (which would be a cycle).
- **`size` is not defaulted to `md`.** An unset group means "not opinionated", leaving each Chip on
  its own default - genuinely distinct from a group that actively sets `md`.
- **`alignment` is not Tag Group's `alignment`.** Same axis name, different meaning: here it measures
  Figma's `primaryAxisAlignItems` MIN/MAX and maps to `justify-content` - which edge the chips pack
  against. Tag Group's decides where its overflow tag renders. Worth stating explicitly, because the
  shared name invites the wrong assumption.
- **No overflow, no selection management, no roving tabindex** - see the spec for why each was
  deliberately left out rather than forgotten.

---

## Validated Figma Details

- `chip-group` component set: node `4636:84492`, page "✅⏲️ Chip Group". Four variants crossing
  `size` (`sm (24)` / `md (32)`) with `alignment` (left/right).
- Every variant: layoutMode HORIZONTAL, layoutWrap WRAP, itemSpacing 8, counterAxisSpacing 8,
  counterAxisAlignItems CENTER, padding 0, no fill or stroke.
- `alignment=left` measures `primaryAxisAlignItems: MIN`; `alignment=right` measures `MAX`.
- Each variant holds ten `chip` instances, all `mode=search`, `filter type=none`, `isSelected=false`,
  each carrying the variant's own size (62px wide at sm, 66px at md).
- No overflow instance, no divider, no "+N more" affordance anywhere in the set.

---

## Examples to document

- [ ] Both alignments, inside a bounded container so the packing edge is visible
- [ ] Both sizes, plus one Chip opting out of the group's size
- [ ] Wrapping onto a second line
- [ ] A live scope selector (independent on/off toggles)
- [ ] A live, removable filter bar
- [ ] A single chip
- [ ] Mixed modes in one group
- [ ] Disabled chips
- [ ] Dark surface
