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
| `size` | `'md' \| 'lg'` | no | `md` |
| `appearance` | `'default' \| 'subtle'` | no | `default` |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | no | `vertical` |
| `invalid` | `boolean` | no | `false` |
| `disabled` | `boolean` | no | `false` |
| `placeholder` | `string` | no | - |
| `searchPlaceholder` | `string` | no | `Type to search` |
| `emptyMessage` | `React.ReactNode` | no | `No matches` |
| `rows` | `number` | no | `3` |
| `className`, `id`, `aria-label`, `aria-labelledby` | - | no | - |

### Value model

```ts
type RichTextNode =
  | { type: 'text'; text: string }
  | { type: 'entity'; entity: RichTextEntity };

type RichTextValue = RichTextNode[];
```

`RichTextEntity` is `{ id, entityType, label, href? }`. Adjacent text runs are merged on
serialization; `<br>` becomes `\n`; empty text nodes are dropped.

## Geometry and tokens

The frame is Text Area's, unchanged - see
[text-area-spec.md](../text-area/text-area-spec.md#geometry) for the per-size table. Additions:

| part | treatment |
| --- | --- |
| slashInput | Text Field's small-input look - raised surface, `border/input`, `border-radius-sm` |
| tagHost | layout only; the Tag atom carries its own tone tokens |
| picker | Menu's panel tokens, capped at 280px with `overflow-y: auto` |
| rows | `--rta-rows` custom property drives min-height in line-height units |

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
5. **Cancel** - `Escape`, a caret leaving the span, or a pointer press outside unwraps the span back
   to a plain text node, preserving what was typed.

## Keyboard

| key | behavior |
| --- | --- |
| `/` | opens the picker at a word boundary; otherwise types literally |
| `ArrowDown` / `ArrowUp` | move the active row, clamped at both ends |
| `Enter` | insert the active entity (picker open only) |
| `Escape` | close the picker, keep the typed text |
| anything else | types into the editor or the `/` span |

Focus never leaves the editor. The active row is marked with the `rta-active` class.

## Accessibility

- `role="textbox"`, `aria-multiline="true"`, `aria-invalid` from `invalid`.
- Named by `aria-label` / `aria-labelledby`, or a `<label htmlFor>` wired to `id`.
- Disabled: `contenteditable=false`, `tabIndex=-1`, slash command suppressed.
- Tags carry `tabIndex={-1}` so caret traversal isn't interrupted by tab stops.
- **Gap:** no `aria-activedescendant` on the editor, so the active picker row is not announced.
  Keyboard operation works; the announcement does not. First item in future considerations.

## Tests

`RichTextArea.test.tsx` - 25 tests, five groups:

- **rendering** - role and multiline, size/appearance/resize classes, invalid wiring, placeholder and
  empty state, `--rta-rows`.
- **disabled** - not editable, not focusable, slash suppressed.
- **value hydration** - text and entity nodes, tag as a link, line breaks, non-empty state.
- **slash command** - opens and wraps the query, recents vs `onSearch`, debounced search on typing,
  word-boundary rule in both directions.
- **picker keyboard** - Enter inserts and reports the value, arrows move and clamp, Escape restores
  plain text, ordinary keys do nothing.
- **serialization** - document order across text and entities, and what remains when a tag is deleted.

jsdom does not simulate `contenteditable` typing, so tests place a caret and dispatch the event the
browser would have sent. Real caret behavior is verified live in Storybook. `scrollIntoView` is called
optionally in the picker precisely because jsdom lacks it - an unguarded call throws in any consumer's
test run.

## Future considerations

- Wire `aria-activedescendant` plus row ids so the active entity is announced.
- Caret-correction guard for Firefox/Safari at the inline span boundary.
- Harden backspace-deletes-a-tag; sanitize pasted HTML into the node model.
- Optional auto-resize-to-content.
- Additional triggers (`@`) driven by the same picker.
