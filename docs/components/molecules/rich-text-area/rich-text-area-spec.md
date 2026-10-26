# Rich Text Area Component Spec

## Overview

Rich Text Area is Text Area's `type=rich-inline` mode: a `contenteditable` multi-line field where
typing `/` opens a grouped entity picker and each choice is inserted inline as a navigational tag. It
reuses Text Area's frame tokens exactly; the difference from Text Area is entirely behavioral.

Shipped as its own component because the contenteditable path and its props are disjoint from the
plain `<textarea>` - different value type, different callbacks, different states.

## Anatomy

```
wrapper (position: relative - the picker anchors to it)
├── editor            role="textbox", aria-multiline, contenteditable
│   ├── text nodes    plain runs
│   ├── <br>          line breaks
│   ├── slashInput    span[data-slash] - the inline `/query` mini-input (transient)
│   └── tagHost       span[contenteditable=false][data-entity-id] - one per tag
│       └── NavTag    portaled Tag atom (an <a> when href is set)
└── picker            EntityPicker - floats at the caret, only while open
    └── Menu          organism, showSearch=false, fullWidth, maxHeight 280
```

## Public API

| prop | type | required | default |
| --- | --- | --- | --- |
| `value` | `RichTextValue` | yes | - |
| `onChange` | `(value: RichTextValue) => void` | yes | - |
| `onSearch` | `(query: string) => EntitySection[] \| Promise<EntitySection[]>` | yes | - |
| `recents` | `EntitySection[]` | no | - |
| `entityConfig` | `Record<string, EntityTypeConfig>` | no | built-in defaults |
| `size` | `'sm' \| 'md' \| 'lg'` | no | `md` |
| `context` | `'default' \| 'inline'` (Text Area's and Figma's `context` axis) | no | `default` |
| `appearance` | `'default' \| 'subtle' \| 'inline'` - **deprecated** alias for `context`: `subtle` and `inline` map to `inline`, `default` to `default`; an explicit `context` wins | no | - |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | no | `vertical` |
| `invalid` | `boolean` | no | `false` |
| `disabled` | `boolean` | no | `false` |
| `required` | `boolean` (sets `aria-required` on the editor) | no | - |
| `placeholder` | `string` | no | - |
| `searchPlaceholder` | `string` | no | `Type to search` |
| `emptyMessage` | `React.ReactNode` | no | `No matches` |
| `rows` | `number` | no | `3` |
| `aria-invalid` | `boolean \| 'true' \| 'false'` (`true`/`'true'` marks the editor invalid, as `invalid` does) | no | - |
| `className`, `id`, `aria-label`, `aria-labelledby`, `aria-describedby` | - | no | - |

### Value model

```ts
type RichTextNode =
  | { type: 'text'; text: string }
  | { type: 'entity'; entity: RichTextEntity };

type RichTextValue = RichTextNode[];
```

`RichTextEntity` is `{ id, entityType, label, href? }`. Adjacent text runs are merged on
serialization; `<br>` becomes `\n`; empty text nodes are dropped. A block's last `<br>` (the last
thing in the editor or in a line `<div>`) is the browser's placeholder that holds an empty line open
for the caret - Chrome adds one when a line ends on a tag - so it isn't a line break and isn't
reported. A value ending in `\n` hydrates with that placeholder after its last `<br>`. Hydration
adds a space after a tag only where no text follows it (the room inserting a tag leaves for the
caret), so a value reports back unchanged.

The component hydrates from `value` once, on mount, then runs uncontrolled: the DOM is the source of
truth while editing (a `contenteditable` surface can't be re-rendered from props on each keystroke
without losing the caret), and `onChange` reports each serialized change. A later `value` is
ignored; remount the component (for example with a new `key`) to replace its content. The value is
deliberately not HTML or Markdown, so the editor's DOM shape never leaks into stored data.

### Entities and tags

`onSearch` returns grouped sections, one per entity type, each rendered as a Menu section with a 16px
(`xxs`) IconTile heading whose tone follows `entityConfig`. A row whose `leadingElement` is an Avatar
or Avatar Group renders it inline in the label, hugging its width, with no description line
(Figma's Families and People list); other rows lead with `leadingElement` or the type's icon.
`entityConfig` merges over `DEFAULT_ENTITY_CONFIG` (`account`/`person` blue, `matter` teal,
`roadmap` purple, `document` default) and drives both the heading tile and the inserted tag.

Each tag is a `NavTag` - a preset over the Tag atom (`size="sm"`, the type's tone and icon,
`tabIndex={-1}`, an `<a>` when `href` is set) - portaled into a `contenteditable="false"` host span
with `user-select: none`, which keeps the tag atomic to the caret. Selected text gets the shared
`--color-content-highlight` `::selection` tint (set on `.editor`); a tag's `user-select: none`
keeps it from being highlighted as text.

## Geometry and tokens

The frame is Text Area's, unchanged - see
[text-area-spec.md](../text-area/text-area-spec.md#geometry) for the per-size table. Additions:

| part | treatment |
| --- | --- |
| slashInput | Text Field's small-input look - raised surface, `border/input`, `border-radius-md` |
| tagHost | layout only; the Tag atom carries its own tone tokens |
| picker | Menu's panel tokens, capped at 280px with `overflow-y: auto` |
| rows | `--rta-rows` custom property drives min-height in line-height units; the editor grows past it with content (no maximum) until the resize grip sets a fixed height |

Sizes and contexts follow Text Area. `sm` keeps `md`'s corners, inline padding, and text, with Text
Area's tighter block padding (`--spacing-075`, through `--rta-padding-block`). The `inline` context
is transparent with no border at rest; hover adds the hover background and a bottom line in
`color-border-input` (not while invalid, focused, or disabled), and focus or invalid paint a 2px
bottom line. In both contexts the error border stays while the editor has focus.

No new tokens. Frame reuse is what makes the rich mode read as the same field as Text Area.

## Slash-command lifecycle

1. **Trigger** - `keydown` of `/` with a collapsed caret whose preceding character is empty or
   whitespace. Mid-word slashes are ignored and type literally.
2. **Open** - a `span[data-slash]` is inserted at the caret containing `/`, the caret is placed after
   it, the picker opens, and an empty-query search runs (`recents` if supplied).
3. **Type** - each `input` event re-reads the span's text; a query containing whitespace ends the
   command. Non-empty queries are debounced 150ms and tagged with a sequence number so a slow
   response cannot overwrite a newer one.
4. **Commit** - `Enter` replaces the span with a tag host plus a trailing space, moves the caret after
   it, portals a `NavTag` in, and emits the new value.
5. **Cancel** - `Escape`, `Tab`, a caret leaving the span, or a pointer press outside unwraps the
   span back to a plain text node, preserving what was typed and the caret's place in it (a caret
   already elsewhere stays where it is).

### Caret guard

The query box is an inline editable span, and at its edge Firefox and Safari can put the caret, or
the typed text, just outside it - a position that looks the same on screen. While the span is open:

- a `selectionchange` listener moves a collapsed caret on the span's outside edge (directly after
  or before it, past empty or zero-width text) back into it, and a caret in front of the `/` to just
  after it. A caret anywhere else in the editor has left the span and closes the picker at once; a
  selection outside the editor (a click in the list) is ignored. It won't correct the same position
  twice within 50ms, so it can't fight a browser that moves the caret straight back.
- a native `beforeinput` listener takes `insertText` while the caret is in the span or on its edge
  and writes the text into the span itself, so it lands in the query in every browser; a space ends
  the command as before. With the caret elsewhere, it closes the picker and lets the text go there.
- `ArrowLeft` over the `/` or `ArrowRight` past the last character closes the picker (keeping the
  text and the caret) and lets the arrow move on; inside the query, arrows move as usual.

Composition input (IME) isn't routed; the browser handles it and `input` follows the span as before.

## Editing

The editor's DOM holds only text nodes, `<br>`s (and the line `<div>`s a browser adds on Enter),
tag hosts, and the query span. `rich/editing.ts` keeps it that way. Paste, drop, drag, and
`beforeinput` are native listeners on the editor: a tag is a portal, and React bubbles an event
from inside one through the React tree to the wrapper, so a drop on a tag would otherwise miss the
editor's handlers.

### Paste and drop

- **Paste** is always cancelled and re-done as plain text from `text/plain`: `\r\n`, `\r`, and
  U+2028/U+2029 become `\n`, other control characters are removed, and the text is inserted as text
  nodes with a `<br>` per line break, replacing the selection, with the caret after it. Nothing is
  parsed as HTML, so no element, attribute, style, script, image, or URL reaches the DOM or the value.
  A selection edge inside a tag moves outside it, so a tag is replaced whole or not at all. Text that
  ends in a line break at the end of a block also gets the placeholder `<br>` that shows the new
  line. A single word pasted into the open `/` query goes into the query; anything with whitespace
  closes the query (keeping it as text) and goes into the text. A paste with no text inserts nothing.
- **Drop** from outside inserts its `text/plain` the same way at the drop point
  (`caretPositionFromPoint` or `caretRangeFromPoint`, past a tag if it lands in one), and closes an
  open query first.
- **Drag within the editor** - selected text, or a tag (whose link the browser would otherwise drag
  as a URL) - moves those nodes to the drop point with `extractContents`, so a tag stays the same
  host and keeps its portal. A drop inside the dragged range does nothing.
- A `beforeinput` of `insertFromPaste`, `insertFromPasteAsQuotation`, or `insertFromYank` that
  reaches the editor without a paste event is handled the same way; `insertFromDrop` is cancelled
  (the drop handler inserts). Disabled, all of these do nothing.

### Deleting a tag

`Backspace` (or a `deleteContentBackward` beforeinput, for keyboards with no usable keydown) with a
collapsed caret directly after a tag removes the whole host; `Delete` (`deleteContentForward`)
directly before one does the same. "Directly" means nothing but empty or zero-width text between
the caret and the tag within the same parent: mid-line, at a line's start or end, between two
adjacent tags, at either end of the editor, or as its only content. That filler is removed with the
tag, the text either side is merged into one node, and the caret goes where the tag was. At the
start of a line, `Backspace` still joins the line to the one above (the tag on that line stays).
`Cmd+Backspace` and composition are left to the browser.

## Keyboard

| key | behavior |
| --- | --- |
| `/` | opens the picker at a word boundary; otherwise types literally |
| `ArrowDown` / `ArrowUp` | move the active row, clamped at both ends |
| `Enter` | insert the active entity (picker open only) |
| `Escape` | close the picker, keep the typed text |
| `Tab` | with the picker open, close it (keeping the typed text) and let focus move on |
| `ArrowLeft` / `ArrowRight` | with the picker open, move within the query; past either end, close it and move on |
| `Backspace` / `Delete` | directly after / before a tag, remove the whole tag; otherwise delete as usual |
| anything else | types into the editor, or into the `/` span while it's open |

Focus stays in the editor while the picker is open. The active row is marked with the `rta-active`
class and named by the editor's `aria-activedescendant`.

## Accessibility

- `role="textbox"`, `aria-multiline="true"`, `aria-haspopup="menu"`. `aria-invalid` is set from
  `invalid`, or from an `aria-invalid` of `true`/`'true'`, which also paints the error border.
- Named by `aria-label` or `aria-labelledby`. A `<label htmlFor>` wired to `id` does **not** name it:
  the editor is a `div`, and a label can only point at a labelable (native) element. Field names it
  anyway, by passing its label's id as `aria-labelledby`, and its `aria-describedby`, `aria-invalid`,
  and `required` land on the editor too.
- `required` sets `aria-required` (a `div` has no native `required`); `aria-describedby` is set on
  the editor as given.
- Disabled: `contenteditable=false`, `tabIndex=-1`, `aria-disabled="true"`, slash command suppressed.
- Tags carry `tabIndex={-1}` so caret traversal isn't interrupted by tab stops.
- Picker: while it is open, `aria-controls` names the picker's Menu by its id (a `useId` value
  ending `-picker`) and `aria-activedescendant` points at the highlighted row, so the active entity
  is announced. The picker gives each row the id `<pickerId>-option-<index>`. Both attributes are
  removed when the picker closes.

## Tests

`RichTextArea.test.tsx` - 67 tests, nine groups:

- **rendering** - role and multiline, size/context/resize classes, the deprecated `appearance`
  mapping, the wiring Field passes (label, description, required, invalid), `aria-disabled`,
  invalid wiring, placeholder and empty state, `--rta-rows`.
- **disabled** - not editable, not focusable, slash suppressed.
- **value hydration** - text and entity nodes, tag as a link, line breaks (a trailing one shown as
  an empty last line and reported once), non-empty state, and a value reported back unchanged.
- **slash command** - opens and wraps the query, recents vs `onSearch`, debounced search on typing,
  word-boundary rule in both directions.
- **picker keyboard** - Enter inserts and reports the value, arrows move and clamp, Escape restores
  plain text, `aria-controls`/`aria-activedescendant` follow the highlighted row, Tab closes the
  list, ordinary keys do nothing.
- **serialization** - document order across text and entities, what remains when a tag is deleted,
  and bold/italic/underline cancelled.
- **paste and drop** - rich HTML (script, `img onerror`, styled spans, links, paragraphs) pastes as
  plain text only, line breaks, a trailing line break, replacing a selection, non-text pastes, beside
  a tag, into the `/` query, drops from outside and onto a tag, moving a tag by drag, the
  `beforeinput` paste path, and disabled.
- **deleting a tag** - Backspace and Delete in each position (mid-line, line start and end, between
  two tags, editor start and end, only content), zero-width filler, Chrome's placeholder `<br>`,
  positions where they delete as usual, and the `beforeinput` delete.
- **query box caret guard** - edge and in-front-of-`/` carets moved back in, a caret moved away
  closing the box in place, typed text routed into the query from its edge, a space ending it, text
  typed away from the box, and the arrow keys past either end.

jsdom does not simulate `contenteditable` typing, so tests place a caret and dispatch the event the
browser would have sent (keydown, paste, drop, a native `beforeinput`, `selectionchange`). Real
caret behavior is verified live in Storybook, in Chromium only: Firefox and Safari, the browsers the
caret guard is for, haven't been checked live. `scrollIntoView` is called
optionally in the picker precisely because jsdom lacks it - an unguarded call throws in any consumer's
test run.

## Future considerations

- Copy and paste tags within the editor (a private clipboard type carrying the node array,
  validated on paste); today a copied tag pastes as its label.
- Put the component's own edits on the browser's undo stack.
- A `maxRows` limit, like Text Area's `autoResize`.
- Additional triggers (`@`) driven by the same picker.
