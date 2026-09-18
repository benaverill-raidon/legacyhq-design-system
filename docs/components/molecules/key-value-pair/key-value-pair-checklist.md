# Key Value Pair Checklist

## Component Information

### Name
KeyValuePair

### Category
Molecule

### Related Components
- Key Value List (wraps pairs in a `<dl>`)
- Text Field (`appearance="inline"` for single-line inline editing)
- Text Area (`appearance="inline"` for multi-line inline editing)
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
- `sm`, `md` (default), `lg` — controls padding-block and typography

### underline
- `true` / `false` (default) — adds a 1px bottom border divider

---

## States

No interactive states — the component is a layout container. Inline-editable children manage their
own hover/focus/invalid states.

---

## Accessibility

- Renders `<dt>` (key) and `<dd>` (value) — correct semantics inside a `<dl>`.
- Must be wrapped in a Key Value List (`<dl>`) for screen readers.
- Inline-editable children must provide their own `aria-label`.

---

## Token Mapping

All tokens are semantic — no primitives consumed directly.
- Key text: `--color-content-subtle`
- Value text: `--color-content-default`
- Underline: `--border-width-sm` solid `--color-border-default`
- Padding: `--spacing-xs` / `--spacing-sm` / `--spacing-md` per size
- Gap: `--spacing-lg`
- Typography: `body-sm` / `body-md` / `body-lg` per size

---

## Implementation decisions

- **Semantic HTML** — `<dt>`/`<dd>` for key/value, expecting a `<dl>` parent.
- **Fixed 40% key width** — matches the Figma layout proportions.
- **`children` over `value`** — children takes precedence, no explicit context prop needed.
- **`align-items: baseline`** — keeps key text and value text (or inline control text) aligned.
- **No own interactive states** — pure layout; children handle their own states.

---

## Verified live (Storybook)

- Static pairs render at all three sizes with correct typography and padding ✓
- Underline border appears and disappears correctly ✓
- Inline editable with TextField + EditIcon renders correctly ✓
- Inline editable with TextArea + EditIcon renders correctly ✓
- Key/value baseline alignment is correct ✓
- Works inside Key Value List ✓

---

## Validated Figma Details

- `key-value-pair` component set: node `4869:244271`, page in Components v1.0.0.
- 22 variants across size (sm/md/lg), context (default/inline), and underline axes.

---

## Examples to document

- [x] Static value
- [x] Underlined pair
- [x] Inline editable with TextField
- [x] Inline editable with TextArea
- [x] All three sizes
- [x] Inside Key Value List
