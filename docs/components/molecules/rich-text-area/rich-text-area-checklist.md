# Rich Text Area Checklist

## Component Information

### Name
RichTextArea

### Tier
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
- **Rich-text formatting** - this is entity tagging, not bold/italic/lists. There's no formatting model.

---

## Variants

### size
`sm` / `md` / `lg` - Text Area's frame sizing (`sm` is `md` with tighter block padding).

### context
`default` / `inline` - Text Area's `context` axis, the same name Figma's text-area uses. `appearance`
is a deprecated alias: `subtle` and `inline` map to `inline`, `default` to `default`.

### resize
`none` / `vertical` / `horizontal` / `both`, default `vertical`.

There is no variant axis for the rich behavior itself - the component *is* the behavior.

---

## States

| state | treatment |
| --- | --- |
| default / hover / focus | Text Area's frame states, unchanged (in the `inline` context, hover adds a bottom line in `color-border-input`) |
| invalid | `aria-invalid` + error border, which stays while the editor has focus |
| disabled | not editable, not focusable, `aria-disabled`, slash command suppressed |
| empty | `data-empty` drives the absolutely-positioned placeholder overlay |
| picker open | floating panel anchored at the caret; focus stays in the editor, whose `aria-controls` names the panel and `aria-activedescendant` the highlighted row |

---

## Accessibility

- `role="textbox"` with `aria-multiline="true"` and `aria-haspopup="menu"`.
- Named by `aria-label` / `aria-labelledby`. A `<label htmlFor>` wired to `id` can't name it (the
  editor is a `div`), so Field names it by passing its label's id as `aria-labelledby`.
- `aria-invalid` reflects `invalid`, or an `aria-invalid` passed in (Field passes it on error).
- `required` sets `aria-required`; `aria-describedby` (Field's message) is set on the editor.
- Disabled removes it from the tab order, turns off editing, and sets `aria-disabled`.
- Tags use `tabIndex={-1}` so caret traversal isn't broken up by tab stops; an `href` tag is a real `<a>`.
- While the picker is open, `aria-controls` names its Menu and `aria-activedescendant` points at the
  highlighted row (each row's id is `<pickerId>-option-<index>`), so arrowing through entities is
  announced. Tab closes the picker and moves focus on.

---

## Token Mapping

No new tokens.

- **Frame** - all of Text Area's: surface, border, radius, padding, typography per size.
- **`/` mini-input** - Text Field's small-input look (raised surface, `border/input`, `border-radius-md`).
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
   active row is marked by class and named by the editor's `aria-activedescendant`, which is why the
   picker gives each row an id.
6. **Tags are portals into non-editable host spans**, which keeps each tag atomic to the caret while
   still being a real React subtree.
7. **`NavTag` is a preset over Tag**, not a new component - Tag already does tone, icon and navigation.
8. **150ms debounce on non-empty queries**, sequence-numbered so a slow response can't overwrite a
   newer one; empty queries resolve immediately from `recents`.
9. **`scrollIntoView` is called optionally** - jsdom lacks it, and an unguarded call throws inside any
   consumer's test run.
10. **`context`, with `appearance` kept as a deprecated alias** - the axis takes Text Area's and
    Figma's name; `subtle` and `inline` map to `inline`, so existing call sites keep working.
11. **Paste and drop are plain text, inserted as text nodes and `<br>`s** - never parsed markup, so
    nothing from the clipboard can add an element, attribute, style, script, or URL. There's no
    formatting model to map rich content into. A drag within the editor moves its own nodes, so a
    tag dragged elsewhere stays a tag.
12. **Backspace/Delete beside a tag remove the whole tag** in the component, from keydown and from
    `beforeinput` (mobile keyboards), merging the text either side, rather than trusting each
    browser's handling of a non-editable inline.
13. **A caret guard on the `/` query box** (`selectionchange` + `beforeinput`), because Firefox and
    Safari can leave the caret, and the typed text, just outside an inline editable span.
14. **Native listeners for paste, drop, drag, and `beforeinput`** - React bubbles events from a
    portal (each tag) to the wrapper, not the editor.
15. **A block's last `<br>` isn't a line break** - it's the browser's placeholder for an empty line,
    so it's left out of the value; hydration adds one after a trailing line break.
16. **Hydration adds no space where text follows a tag**, so a value reports back unchanged (it
    used to double the space in `' about the '`).
17. **Ctrl+B, I, and U are cancelled** (`format*` in `beforeinput`): the value has no formatting, so
    the `<b>`/`<i>`/`<u>` they added was invisible to it.

---

## Verified live (Storybook)

- `/` at a word boundary opens the picker; mid-word it types literally.
- Typing filters; grouped sections render with IconTile headings; people rows lead with avatars that
  hug their width.
- Arrow keys move the active row; Enter inserts a blue tag that replaces the query span.
- Escape restores the typed text as plain text.
- The value round-trips: insert a tag, read `onChange`, re-hydrate from that array.
- Backspace right after a tag and Delete right before one remove the whole tag (mid-line, at the end
  of the editor after Chrome's placeholder `<br>`, at the start of an Enter-made line), and the value
  has no stray line break.
- A paste event carrying a `<script>`, an `<img onerror>`, a styled span, a `javascript:` link, and a
  paragraph inserts only its plain text and line breaks; nothing runs; typing continues on the new
  line. (The event was dispatched in the page: the test browser couldn't write the system clipboard,
  so a real Ctrl+V of rich text wasn't exercised.)
- With the query open, arrows move inside it and close it past either end; a caret placed just after
  the box moves back in and typing lands in the query; a caret moved elsewhere closes it in place;
  clicking a row still links it.
- Chromium only. Firefox and Safari, which the caret guard is for, weren't checked live.
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
- Sizes, context and states
- Labelled by Field
- Anti-examples: using it for plain text; driving `value` per keystroke; storing HTML
