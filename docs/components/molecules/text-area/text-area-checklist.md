# Text Area Checklist

## Component Information

### Name
TextArea

### Category
Molecule (grouped with Text Field, its single-line sibling; composes no other component)

### Related Components
- Text Field (single-line free text; shares the frame token-for-token)
- Select (choosing from a fixed set of options)
- Label (a trailing unit/status pill, as Text Field uses)

---

## Purpose

### What problem does this component solve?
Writing or editing genuinely multi-line free text - notes, descriptions, comments, message bodies -
in a bordered, resizable field.

### Why does it need to exist?
Text Field is single-line by design. Figma has a dedicated `text-area` component set (96 variants)
for the multi-line case, with its own size/tone/state axes and a resize affordance.

---

## Usage

### When should this component NOT be used?
- A single-line value — Text Field
- A value from a fixed set of options — Select
- Inline entity tagging — not supported yet (`type=rich-inline`, the slash-command tagging mode, is
  unimplemented)

---

## Variants

### size
- `md` (default), `lg` — padding/radius/font. (`sm` was removed — it read almost identically to md.)

### appearance
- `default` (bordered box), `subtle` (transparent until hover/focus/invalid, bottom accent only) —
  Figma names this axis `tone`

### resize
- `none`, `vertical` (default), `horizontal`, `both` — maps to CSS `resize`

---

## States

Required: default, hover, focus, invalid, disabled.
Live pseudo-classes (`:hover`, `:focus`) with a documentation-only `data-force-state` pin. `typing`,
`filled`, and `autofill` (Figma states) need no distinct styling — they render as default/focus.

---

## Accessibility

- Native `<textarea>` (role `textbox`, multiline) — native keyboard/scroll/wrap for free.
- No built-in label — pair with `<label htmlFor>` or `aria-label`.
- `aria-invalid` reflects `invalid`; disabled uses the native attribute; the frame focus border is the
  focus affordance.

---

## Token Mapping

No new tokens — all reused from Text Field. Figma's `background/input/*` + `border/focused` naming
maps onto `elevation/surface/raised/*` + `border/focus` (same intent). Focus/invalid paint the thicker
edge via inset box-shadow, not a real border-width change (no text shift).

---

## Implementation decisions

- **Frame on the `<textarea>` itself**, no wrapper — Text Area has no icon slots, and it lets the
  native resize grip work with no wiring.
- **`appearance`, not `tone`** — same name and axis as its Text Field sibling.
- **Reuse Text Field's tokens** rather than invent unbacked `background/input/*` tokens (reuse-first).
- **`resize` prop** (default `vertical`); disabled forces `resize: none`.
- **`type=rich-inline` ships as RichTextArea** — an inline entity-tagging mode (slash-command
  picker + inline navigational tags), not rich-text. Separate component, since its value, its
  callbacks and its surface are all disjoint from the plain `<textarea>`; no `type` prop here.
- **No forced default height** — initial height comes from the native `rows` attribute.

---

## Verified live (Storybook)

- Geometry per size: padding md 8/8, lg 12/12; radius lg→xl; font 14→16 ✓ (sm removed)
- default/hover/focus/invalid/disabled border + background match Figma's state matrix ✓
- subtle: transparent at rest, square bottom corners ✓
- resize axis renders per option; disabled locks it ✓
- Dark surface renders correctly; no console errors ✓

---

## Validated Figma Details

- `text-area` component set: node `1697:19487`, page "🚧 Text Area". Axes: type / size (md, lg after
  the sm removal) / tone / state / isDisabled / isInvalid. Exact post-removal variant count to be
  re-confirmed live (was 96 with three sizes).
- The visual frame (fill/border/radius) is bound on the component node; the inner `Container` frame
  carries only padding.
- `type=rich-inline` is visually identical to `default` in the static mockup — the difference is the
  inline entity-tagging behavior (press `/` → searchable grouped dropdown → insert a navigational
  tag) — deferred.

---

## Examples to document

- [x] Basic labelled field
- [x] Controlled with a character count
- [x] Sizes and appearances
- [x] Invalid and disabled
- [x] Fixed height (resize=none)
- [x] Dark surface
