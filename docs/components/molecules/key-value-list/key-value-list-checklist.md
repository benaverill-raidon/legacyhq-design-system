# Key Value List Checklist

## Component Information

### Name
KeyValueList

### Category
Molecule

### Related Components
- Key Value Pair (the individual row this list wraps)

---

## Purpose

### What problem does this component solve?
Provides the semantic `<dl>` structure for a vertical stack of Key Value Pair items.

### Why does it need to exist?
Key Value Pair renders `<dt>`/`<dd>` elements that need a `<dl>` parent for correct screen reader
announcements. This wrapper provides that structure with reset browser defaults.

---

## Usage

### When should this component NOT be used?
- Tabular data with sortable/filterable columns
- A single isolated key/value pair (wrap in a plain `<dl>` instead, or use this)

---

## Variants

None — pure layout container.

---

## States

No interactive states.

---

## Accessibility

- Renders a `<dl>` element for description list semantics.
- Children must be Key Value Pair items.

---

## Token Mapping

No tokens consumed directly — pure layout.

---

## Implementation decisions

- **`<dl>` element** for semantic HTML.
- **No own spacing** — each child KeyValuePair manages its own padding and dividers.
- **`display: flex; flex-direction: column`** for clean vertical stacking.
- **Reset browser defaults** — `margin: 0; padding: 0` on the `<dl>`.

---

## Verified live (Storybook)

- Static underlined list renders correctly ✓
- Static clean (no underlines) list renders correctly ✓
- Mixed editable and static pairs render correctly ✓
- All three sizes render correctly via KeyValuePair size prop ✓

---

## Validated Figma Details

- `key-value-list` component set: node `4882:341496`, file Components v1.0.0.
- 2 variants (underlined vs. clean).

---

## Examples to document

- [x] Static underlined list
- [x] Static clean list
- [x] Mixed editable and static pairs
- [x] Multiple sizes
