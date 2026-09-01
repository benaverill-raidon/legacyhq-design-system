# Rich Text Area Generation Prompt

The prompt/spec used to build Rich Text Area. Kept so the component can be regenerated from intent.

## Goal

Build **Rich Text Area** — Text Area's `type=rich-inline` mode. A `contenteditable` multi-line field
where typing `/` opens a grouped picker of entities and each choice is inserted inline as a
navigational tag (a colored, icon-bearing chip linking to that record). Reuse Text Area's frame
token-for-token so the two read as one field; everything that differs is behavior.

Ship it as its own component, not a `type` prop on TextArea — the contenteditable path, its value
type, and its callbacks are all disjoint from the plain `<textarea>`.

## Requirements

- **Value is a flat node array**, not HTML or Markdown: `{ type: 'text', text }` runs interleaved with
  `{ type: 'entity', entity: { id, entityType, label, href? } }`. Adjacent text merges on
  serialization; `<br>` becomes `\n`; empty text nodes are dropped.
- **Hydrate from `value` once, then run uncontrolled.** A contenteditable surface cannot be
  re-rendered from props per keystroke without destroying the caret. Report every edit via `onChange`.
- **Slash command.** `/` starts a command only at the start of the editor or after whitespace — never
  mid-word. Wrap the query in an inline editable span styled like Text Field's small input (the Figma
  `type-cursor` part). The user types **into** that span, so the picker panel has **no search field**
  (`showSearch={false}`) — options only, exactly like Figma.
- **Picker.** Compose the Menu organism: grouped sections one per entity type, 16px (`xxs`) IconTile
  headings, `fullWidth`, `maxHeight` 280 with scroll. A row whose `leadingElement` is an Avatar or
  AvatarGroup renders inline, hugging its width with no description line. Anchor the panel at the
  caret, within a `position: relative` wrapper.
- **Keyboard.** ArrowUp/ArrowDown move the active row (clamped both ends); Enter inserts; Escape closes
  and unwraps the query back to plain text keeping what was typed; a pointer press outside closes it.
  **Focus stays in the editor** so typing keeps reaching the query — mark the active row with a class.
- **Tags.** Each is a `NavTag` (a preset over the Tag atom — Tag already does tone, `elemBefore`, and
  `href`) portaled into a `contenteditable="false"` host span carrying `data-entity-*`. The host span
  is what makes a tag atomic to the caret. `tabIndex={-1}` so caret traversal isn't broken by tab stops.
- **`entityConfig`** maps entityType → `{ tone, icon }`, driving both the section heading tile and the
  inserted tag, so color encodes type consistently in both places. Ship sensible defaults.
- **Search.** Empty query resolves from `recents` when supplied, else `onSearch('')` — instant on open.
  Debounce non-empty queries 150ms and sequence-number responses so a slow one can't overwrite a newer.
- **Frame props** mirror Text Area: `size` (md/lg), `appearance` (default/subtle), `resize`, `invalid`,
  `disabled`, `rows` (via a `--rta-rows` custom property, default 3). Disabled turns off editing,
  drops the tab order, and suppresses the slash command.
- **Placeholder** renders as an absolutely-positioned overlay from `data-placeholder`, so it never sits
  in the text flow or displaces the caret at offset 0.
- **Reuse tokens only** — Text Area's frame, Text Field's small-input look, Menu's panel. Create none.
- Call `scrollIntoView` **optionally** on the active row — jsdom lacks it and an unguarded call throws
  inside consumers' tests.

## Files

- `rich/rich-text-area.tsx`, `rich/rich-text-area.types.ts`, `rich/rich-text-area.module.css`,
  `rich/entity-picker.tsx`, `rich/nav-tag.tsx`, `rich/index.ts`
- `RichTextArea.stories.tsx` (Playground, Prefilled, States), `RichTextArea.test.tsx`
- Docs: `rich-text-area.md`, `-spec.md`, `-checklist.md`, `-prompt.md`, `.contract.json`,
  `.examples.json`
- Add to `llms.txt` (Molecules); regenerate the registry and exemplars.

## Verification

`npm run validate` clean. Verify live in Storybook, in light and dark: `/` at a boundary opens the
picker and types literally mid-word; grouped results with IconTile headings and avatar rows; arrows
move the active row; Enter inserts a tag replacing the query; Escape restores plain text; the value
round-trips through `onChange` and re-hydration.

Tests cannot cover real caret behavior — jsdom does not simulate contenteditable typing — so drive the
component the way the browser would (place a caret, dispatch the event) and verify caret correctness
live.

## Known gaps to carry forward

- No `aria-activedescendant` — the active picker row is not announced to screen readers.
- No caret-correction guard for Firefox/Safari at the inline span boundary (verified in Chrome only).
- Backspace-deletes-a-tag not hardened in every position; pasted HTML is not sanitized into the model.
