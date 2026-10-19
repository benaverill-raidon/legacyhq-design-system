# Text Area Checklist

## Component Information

### Name
TextArea

### Tier
Molecule (grouped with Text Field, its single-line sibling; composes no other component)

### Related Components
- Text Field (single-line free text; shares the frame token-for-token)
- Select (choosing from a fixed set of options)
- Label (a trailing unit/status pill, as Text Field uses)
- Key Value Pair (embeds Text Area with `context="inline"` and `iconAfter`)

---

## Purpose

### What problem does this component solve?
Writing or editing genuinely multi-line free text - notes, descriptions, comments, message bodies -
in a bordered, resizable field.

### Why does it need to exist?
Text Field is single-line by design. Figma has a dedicated `text-area` component set (96 variants)
for the multi-line case, with its own size/context/state axes and a resize affordance.

---

## Usage

### When should this component NOT be used?
- A single-line value — Text Field
- A value from a fixed set of options — Select
- Inline entity tagging — Rich Text Area (Figma's `type=rich-inline`, the slash-command tagging mode)

---

## Variants

### size
- `sm`, `md` (default), `lg` — padding/radius/font. Compact `sm` is supported in code for key/value rows.
- `autoResize` (default false) grows/shrinks content from the control-size minimum; `maxRows` (default 6) caps growth before scrolling.

### context
- `default` (bordered box), `inline` (chromeless at rest; raised-hover background and bottom border
  on hover, bottom-only focus/error line on focus/invalid) — the same name and values as Figma's
  `context` axis
- The deprecated `appearance` prop still works: `subtle` and `inline` map to `inline`

### resize
- `none`, `vertical` (default), `horizontal`, `both` — maps to CSS `resize`

---

## States

Required: default, hover, focus, invalid, disabled, autofill.
Live pseudo-classes (`:hover`, `:focus`, `:autofill`) with a documentation-only `data-force-state`
pin. `typing` and `filled` (Figma states) need no distinct styling — they render as default/focus.
Figma's `autofill` layers `color/background/autofill/default` over the raised surface on
`context=default`, keeping its resting stroke, and has no fill on `context=inline`; code applies
it when the textarea matches `:autofill` and hides the browser's own autofill fill (background
clipped to the text). Per design feedback: hover replaces the tint, focus and invalid keep it, and
`context=inline` stays chromeless at rest, showing the tint only while focused.

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
edge via inset box-shadow, not a real border-width change (no text shift). Autofill uses the existing
semantic `--color-background-autofill-default`, layered over `--color-elevation-surface-raised-default`
exactly as Figma binds it.

---

## Implementation decisions

- **Wrapper `<div>` pattern** (matching Text Field) — the frame styling lives on a wrapper div, with
  the textarea as a transparent child. Enables the trailing icon/action slot (`iconAfter`). Resize
  still works via `resize: inherit` on the textarea and `overflow: auto` on the wrapper.
- **`iconAfter` slot** — trailing icon or interactive control (e.g. edit pencil IconButton). Not
  `aria-hidden`; may hold a real focusable action.
- **`context`** — same name and axis as its Text Field sibling and Figma. Two values: `default`
  (bordered), `inline` (chromeless at rest, hover background and bottom-only border on interaction).
  `appearance` is a deprecated alias (`subtle`/`inline` → `inline`).
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
- resize axis renders per option; disabled locks it ✓
- Dark surface renders correctly; no console errors ✓
- iconAfter: decorative icon, interactive IconButton, and inline context all render correctly ✓
- inline: chromeless at rest, square bottom corners, hover background + bottom-only border on
  hover/focus/invalid, keeps padding and top radius ✓
- Key Value Pair embedding with inline TextArea + iconAfter ✓
- autofill (pinned, 2026-10-14): raised surface + `rgba(0, 54, 85, 0.16)` tint in light,
  `rgba(106, 173, 212, 0.16)` in dark; `border/input` 1px on default ✓. Real browser autofill
  (Edge Cases) hides the browser's own fill - confirmed by hand 2026-10-14 ✓
- autofill design feedback (2026-10-14): hover shows `raised/hover` with no tint; focus and invalid
  keep the tint under their border; inline is transparent at rest and tinted only while focused ✓

---

## Validated Figma Details

- `text-area` component set: node `1697:19487`, page "🚧 Text Area". Axes: type / size (md, lg after
  the sm removal) / context (default, inline) / state / isDisabled / isInvalid. 64 variants after the
  removal (was 96 with three sizes), re-confirmed live 2026-10-13.
- `state=autofill` (8 variants: type x size x context): on `context=default`, fills
  `color/elevation/surface/raised/default` then `color/background/autofill/default` (16% since
  2026-10-14, raised from 8% in the Tokens file) with a `color/border/input` 1px stroke; on
  `context=inline`, no fill or stroke, the same as inline `filled` (its two fills were removed on
  2026-10-14, per design feedback); value text `color/content/default`.
- The visual frame (fill/border/radius) is bound on the component node; the inner `Container` frame
  carries only padding.
- `type=rich-inline` is visually identical to `default` in the static mockup — the difference is the
  inline entity-tagging behavior (press `/` → searchable grouped dropdown → insert a navigational
  tag) — deferred.

---

## Examples to document

- [x] Basic labelled field
- [x] Controlled with a character count
- [x] Sizes and contexts
- [x] Invalid and disabled
- [x] Fixed height (resize=none)
- [x] Dark surface
- [x] iconAfter with decorative icon
- [x] iconAfter with interactive IconButton
- [x] Inline context (chromeless)
- [x] Inline context inside Key Value Pair
- [x] Autofill, pinned (States) and real browser autofill (Edge Cases)
