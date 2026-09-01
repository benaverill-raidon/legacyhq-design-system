# Rich Text Area Checklist

## Component Information

### Name
RichTextArea

### Category
Molecule - Text Area's `type=rich-inline` mode, shipped as its own component.

### Related Components
- **TextArea** - the plain multi-line sibling; shares the frame token-for-token.
- **Menu** - composed as the entity picker (search hidden).
- **Tag** - composed as the inserted navigational tag, via the `NavTag` preset.
- **TextField** - the `/` mini-input borrows its small-input look.
- **Avatar / AvatarGroup / IconTile** - picker row and section-heading leading visuals.

---

## Purpose

### What problem does this component solve?
Text that needs to point at real records. A note mentioning a person and a matter, a comment linking a
document - written as one continuous line of prose, with the links inserted while typing rather than
through a separate "add link" affordance.

### Why does it need to exist?
Text Area can't do it: a `<textarea>` holds a string and cannot contain elements. The mode needs a
`contenteditable` surface, a structured value, a search callback, and an entity-to-tone mapping. Those
props are disjoint from Text Area's, so a shared `type` prop would have meant one component with two
unrelated APIs and two unrelated value types.

---

## Usage

### When should this component NOT be used?
- **Plain multi-line text** - use TextArea. Without entities to link, this trades native `<textarea>`
  behavior for nothing.
- **Choosing one value from a fixed set** - use Select.
- **A required, screen-reader-critical flow** - the picker isn't announced yet (see Accessibility).
- **Rich-text formatting** - this is entity tagging, not bold/italic/lists. There's no formatting model.

---

## Variants

### size
`md` / `lg` - Text Area's frame sizing.

### appearance
`default` / `subtle` - Text Area's appearance axis (Figma calls it `tone`).

### resize
`none` / `vertical` / `horizontal` / `both`, default `vertical`.

There is no variant axis for the rich behavior itself - the component *is* the behavior.

---

## States

| state | treatment |
| --- | --- |
| default / hover / focus | Text Area's frame states, unchanged |
| invalid | `aria-invalid` + error border |
| disabled | not editable, not focusable, slash command suppressed |
| empty | `data-empty` drives the absolutely-positioned placeholder overlay |
| picker open | floating panel anchored at the caret; focus stays in the editor |

---

## Accessibility

- `role="textbox"` with `aria-multiline="true"`.
- Named by `aria-label` / `aria-labelledby` / `<label htmlFor>` wired to `id`.
- `aria-invalid` reflects `invalid`.
- Disabled removes it from the tab order and turns off editing.
- Tags use `tabIndex={-1}` so caret traversal isn't broken up by tab stops; an `href` tag is a real `<a>`.
- **Known gap:** no `aria-activedescendant`. The active picker row is marked with a class only, so
  arrowing through entities is silent to assistive tech. Keyboard operation works. This is the first
  item in future considerations and is recorded in the contract's `knownLimitations`.

---

## Token Mapping

No new tokens.

- **Frame** - all of Text Area's: surface, border, radius, padding, typography per size.
- **`/` mini-input** - Text Field's small-input look (raised surface, `border/input`, `border-radius-sm`).
- **Tag host** - layout only; the Tag atom carries its own tone tokens.
- **Picker** - the Menu organism's panel tokens, capped at 280px and scrolling.

---

## Implementation decisions

1. **Separate component, not a `type` prop.** Disjoint props, disjoint value type.
2. **Flat node array as the value**, not HTML or Markdown - a stable contract that doesn't leak the
   editor's DOM shape into consumers' data.
3. **Hydrate once, then lead.** A contenteditable surface can't be re-rendered from props per
   keystroke without destroying the caret. `value` is initial content; `onChange` reports changes.
4. **Query typed inline, panel shows options only** (`showSearch={false}`) - matches Figma, and mirrors
   how Select types in the trigger.
5. **Focus stays in the editor** while the picker is open, so typing keeps reaching the query. The
   active row is marked by class - the reason the `aria-activedescendant` gap exists.
6. **Tags are portals into non-editable host spans**, which keeps each tag atomic to the caret while
   still being a real React subtree.
7. **`NavTag` is a preset over Tag**, not a new component - Tag already does tone, icon and navigation.
8. **150ms debounce on non-empty queries**, sequence-numbered so a slow response can't overwrite a
   newer one; empty queries resolve immediately from `recents`.
9. **`scrollIntoView` is called optionally** - jsdom lacks it, and an unguarded call throws inside any
   consumer's test run.

---

## Verified live (Storybook)

- `/` at a word boundary opens the picker; mid-word it types literally.
- Typing filters; grouped sections render with IconTile headings; people rows lead with avatars that
  hug their width.
- Arrow keys move the active row; Enter inserts a blue tag that replaces the query span.
- Escape restores the typed text as plain text.
- The value round-trips: insert a tag, read `onChange`, re-hydrate from that array.
- Console clean; full suite green.

---

## Validated Figma Details

- Shares Text Area's component set (`1697:19487`) - `rich-inline` is a `type` axis value there and is
  visually identical to `default`.
- The `/` mini-input follows the `type-cursor` figma-part added to text-field on 2026-08-28
  (open-search / type-to-search variants), fed into a dropdown-menu variant with a defined open menu.
- Section headings are 16px (`xxs`) IconTiles.
- Because the mode is behavior rather than appearance, most of the component has no static Figma
  counterpart to verify against - the picker anatomy is the part that does.

---

## Examples to document

- Basic entity tagging with a search callback
- Recents on open
- Tone and icon per entity type
- Prefilled from stored content
- People rows with avatars
- Sizes, appearance and states
- Anti-examples: using it for plain text; driving `value` per keystroke; storing HTML; relying on it
  as an accessible combobox
