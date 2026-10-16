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
serialization; `<br>` becomes `\n`; empty text nodes are dropped.

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
   span back to a plain text node, preserving what was typed.

## Keyboard

| key | behavior |
| --- | --- |
| `/` | opens the picker at a word boundary; otherwise types literally |
| `ArrowDown` / `ArrowUp` | move the active row, clamped at both ends |
| `Enter` | insert the active entity (picker open only) |
| `Escape` | close the picker, keep the typed text |
| `Tab` | with the picker open, close it (keeping the typed text) and let focus move on |
| anything else | types into the editor or the `/` span |

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

`RichTextArea.test.tsx` - 30 tests, six groups:

- **rendering** - role and multiline, size/context/resize classes, the deprecated `appearance`
  mapping, the wiring Field passes (label, description, required, invalid), `aria-disabled`,
  invalid wiring, placeholder and empty state, `--rta-rows`.
- **disabled** - not editable, not focusable, slash suppressed.
- **value hydration** - text and entity nodes, tag as a link, line breaks, non-empty state.
- **slash command** - opens and wraps the query, recents vs `onSearch`, debounced search on typing,
  word-boundary rule in both directions.
- **picker keyboard** - Enter inserts and reports the value, arrows move and clamp, Escape restores
  plain text, `aria-controls`/`aria-activedescendant` follow the highlighted row, Tab closes the
  list, ordinary keys do nothing.
- **serialization** - document order across text and entities, and what remains when a tag is deleted.

jsdom does not simulate `contenteditable` typing, so tests place a caret and dispatch the event the
browser would have sent. Real caret behavior is verified live in Storybook. `scrollIntoView` is called
optionally in the picker precisely because jsdom lacks it - an unguarded call throws in any consumer's
test run.

## Future considerations

- Caret-correction guard for Firefox/Safari at the inline span boundary.
- Harden backspace-deletes-a-tag; sanitize pasted HTML into the node model.
- A `maxRows` limit, like Text Area's `autoResize`.
- Additional triggers (`@`) driven by the same picker.
