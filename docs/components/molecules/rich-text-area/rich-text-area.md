# Rich Text Area

Rich Text Area is [Text Area](../text-area/text-area.md)'s `type=rich-inline` mode: a multi-line field
where prose and links to real records live in the same line of text. While typing, pressing **`/`**
opens a grouped picker of entities; choosing one drops it inline as a **navigational tag** - a
colored, icon-bearing chip that links to that record.

It reuses Text Area's frame token-for-token, so on screen the two are the same field. Everything that
differs is behavior, which is exactly why it's a separate component rather than a `type` prop: one is
a native `<textarea>` holding a string, the other is a `contenteditable` surface holding a structured
node array, plus a search callback and an entity config. Folding both into one component would have
meant two disjoint prop sets and two disjoint values behind a single name.

Use Rich Text Area when the text someone writes needs to *point at things* - a note that mentions a
person and a matter, a comment that links a document. For plain multi-line text, use Text Area; it's a
real `<textarea>` and gets native behavior for free.

## The value is a node array

The value is a flat array of nodes - runs of text interleaved with entities:

```tsx
[
  { type: 'text', text: 'Ask ' },
  { type: 'entity', entity: { id: 'p1', entityType: 'person', label: 'Ben Averill', href: '/people/p1' } },
  { type: 'text', text: ' about the filing' },
]
```

That is what you persist. It's deliberately not HTML or Markdown: storing HTML would leak the
editor's DOM shape into your data and make every consumer parse it back out. Serialize the node array
however your store needs.

The component **hydrates from `value` once, then leads**. A `contenteditable` surface can't be
re-rendered from props on each keystroke without destroying the caret, so after mount the DOM is the
source of truth and `onChange` reports each serialized change. Treat `value` as the initial content,
not as a live binding.

## The slash command

`/` starts a command only at the beginning of the editor or after whitespace - a slash mid-word stays
a literal character, so URLs and dates type normally.

When it fires, the query is wrapped in a small bordered span inside the text (the Figma `type-cursor`
look, borrowed from Text Field's small-input styling) and you type **into** it. The picker panel
therefore has no search field of its own; it shows options only, exactly as in Figma. This mirrors
[Select](../select/select.md), where the trigger is typed in and the panel just lists.

- **Arrow keys** move the active row, clamped at both ends.
- **Enter** inserts the active entity, replacing the `/query` span with a tag and a trailing space.
- **Escape** closes the picker and unwraps the query back to plain text, keeping what was typed.
- A pointer press outside the field closes it too.

Focus stays in the editor the whole time - that's what lets typing keep reaching the query - so the
active row is marked with a class rather than by moving focus.

An empty query resolves from **`recents`** when you supply it (otherwise `onSearch('')`), so opening
the picker is instant. Non-empty queries are debounced 150ms, and out-of-order responses are
discarded, so a slow search can't overwrite a newer one.

## Entities and their tags

`onSearch` returns **grouped sections**, one per entity type, each rendered with a 16px
[IconTile](../icon-tile/icon-tile.md) heading. A row can lead with an
[Avatar](../../atoms/avatar/avatar.md) or [Avatar Group](../avatar-group/avatar-group.md) - people
rows do, and they hug their width with no description line, matching Figma - or with a tinted icon.

**`entityConfig`** maps each `entityType` to a tag `tone` and a default icon, used for *both* the
picker row and the inserted tag. Give each type its own tone: color then encodes type consistently in
both places, so a row and the tag it becomes read as the same object.

Each tag is a [Tag](../../atoms/tag/tag.md) with `tabIndex={-1}`, portaled into a
`contenteditable="false"` host span. The host span is what makes a tag atomic to the caret - without
it, the caret walks into the tag's internals. A tag with an `href` is a real `<a>`.

`NavTag` is a preset over Tag rather than a new component: Tag already does the color, the icon, and
the navigation, so an entity type only needs to resolve to a tone plus an icon.

## Accessibility, honestly

The editor is a `role="textbox"` with `aria-multiline`, takes `aria-label` / `aria-labelledby`, and
reflects `aria-invalid`. Disabled turns off `contenteditable`, drops it from the tab order, and
suppresses the slash command.

**The picker is not yet announced to screen readers.** The active row is marked with a class, but the
editor does not set `aria-activedescendant`, so arrowing through entities is silent to assistive tech
even though it works by keyboard. That's the first thing to fix, and it's tracked as a known
limitation rather than papered over.

## Known limitations

- **No `aria-activedescendant`** on the editor (above).
- **Cross-browser caret.** The `/` mini-input relies on the browser keeping typing inside an inline
  editable span. Verified in Chrome; Firefox and Safari can let the caret drift out at the span
  boundary, and no correction guard is in place yet.
- **Backspace-deletes-a-tag** is not fully hardened in every position.
- **Paste** isn't sanitized into the node model; `<br>` is handled, richer pasted HTML isn't.
- **No auto-resize** - height comes from `rows` and the resize grip.
- **Tests can't cover the caret.** jsdom doesn't simulate `contenteditable` typing, so the suite
  drives the component the way the browser would (place a caret, dispatch the event) and covers
  rendering, hydration, the slash lifecycle, picker keyboard, and serialization. Caret correctness is
  verified live in Storybook, not in CI.

Related: [Text Area](../text-area/text-area.md) (plain multi-line text),
[Menu](../../organisms/menu/menu.md) (the picker), [Tag](../../atoms/tag/tag.md) (the inserted tag),
[Text Field](../text-field/text-field.md) (single-line free text).
