# Key Value Pair Checklist

## Component Information

### Name
KeyValuePair

### Tier
Molecule

### Related Components
- Key Value List (wraps pairs in a `<dl>`)
- Text Field (`context="inline"` for single-line inline editing)
- Text Area (`context="inline"` for multi-line inline editing)
- Field (for full form layouts — not the same use case)

---

## Purpose

### What problem does this component solve?
Displaying metadata as scannable label/value rows, both static and inline-editable.

### Why does it need to exist?
Metadata presentation is a recurring pattern — client details, account information, settings — that
needs consistent layout, typography, and semantic structure across the product.

---

## Usage

### When should this component NOT be used?
- Full form layouts — use Form + Field
- Data tables — use a table component

---

## Variants

### size
- `sm`, `md` (default), `lg` — sets the row's minimum height (`--size-control-sm/md/lg`) and typography; does not size an inline control in `children`

### underline
- `true` / `false` (default) — adds a 1px bottom border divider

---

## States

No interactive states — the component is a layout container. Inline-editable children manage their
own hover/focus/invalid states (the standard `context="inline"` treatment, including the hover
background); Key Value Pair only squares their frame corners.

---

## Accessibility

- Renders `<dt>` (key) and `<dd>` (value) — correct semantics inside a `<dl>`.
- Must be wrapped in a Key Value List (`<dl>`) for screen readers.
- Inline-editable children must provide their own `aria-label`.
- An editable value in Inline Edit uses `actionPlacement="end"`, so the row keeps its height while editing.

---

## Token Mapping

All tokens are semantic — no primitives consumed directly.
- Key text: `--color-content-subtle`
- Value text: `--color-content-default`
- Underline: `--border-width-sm` solid `--color-border-default`
- Minimum row height: `--size-control-sm` / `--size-control-md` / `--size-control-lg` per size
- Key and static value inline-start inset: `--spacing-sm`, `--spacing-md` at `lg`
- Gap: `--spacing-lg`
- Typography: `body-sm` / `body-md` / `body-lg` per size

---

## Implementation decisions

- **Semantic HTML** — `<dt>`/`<dd>` for key/value, expecting a `<dl>` parent.
- **Fixed 40% key width** — matches the Figma layout proportions.
- **`children` over `value`** — children takes precedence, no explicit context prop needed.
- **`align-items: flex-start`** — the key stays at the top of the row, centered in the first control-height band; a static value is centered in the row (`align-self: center`).
- **No own interactive states** — pure layout; children handle their own states.

---

## Verified live (Storybook)

- Static pairs render at all three sizes with correct typography and row height ✓
- Underline border appears and disappears correctly ✓
- Inline editable with TextField + EditIcon renders correctly ✓
- Inline editable with TextArea + EditIcon renders correctly ✓
- Key/value vertical alignment is correct ✓
- Works inside Key Value List ✓

---

## Validated Figma Details

- `key-value-pair` component set: node `4869:244271`, page in Components v1.0.0.
- 22 variants across size (sm/md/lg), context (default/inline), and underline axes.
- The inline variants use the standard Text Field/Text Area/Select `context=inline` instances, so
  code passes `context="inline"` children with no Key Value Pair-specific field look.

---

## Examples to document

- [x] Static value
- [x] Underlined pair
- [x] Inline editable with TextField
- [x] Inline editable with TextArea
- [x] All three sizes
- [x] Inside Key Value List
