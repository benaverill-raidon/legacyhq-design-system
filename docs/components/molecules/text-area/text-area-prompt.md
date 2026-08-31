# Text Area Generation Prompt

The prompt/spec used to build Text Area. Kept so the component can be regenerated from intent.

## Goal

Build **Text Area**, the multi-line counterpart of Text Field: a real native `<textarea>` in the same
bordered frame, sharing Text Field's size/appearance/invalid/state treatment token-for-token, plus a
`resize` axis. Match Figma's `text-area` component set (node `1697:19487`, "🚧 Text Area" page, 96
variants) verified live via the Desktop Bridge.

## Requirements

- Render a real native `<textarea>`. Put the frame styling **directly on the textarea** (no wrapper) —
  Text Area has no icon slots, and this lets the native resize grip work for free.
- Props: `size` (md/lg, default md — sm was removed as near-identical to md), `appearance`
  (default/subtle, default default — Figma's `tone`
  axis, renamed to match Text Field), `invalid` (boolean), `resize` (none/vertical/horizontal/both,
  default vertical), `className`, and all native textarea attributes via `...rest`. Forward the ref to
  the `<textarea>`.
- Geometry per size, from Figma: padding block/inline md 8/8, lg 12/12; radius lg (md), xl (lg); font
  body-md (md), body-lg (lg).
- States (appearance=default): default `surface/raised/default` + `border/input`; hover
  `surface/raised/hover`; focus `border/focus` (2px via inset box-shadow); invalid `border/error` (2px
  via box-shadow); disabled `background/disabled` + `border/disabled`, cursor not-allowed, `resize:
  none`. Suppress hover once focused. Focus/invalid must NOT change real `border-width` (paint the 2nd
  pixel with `box-shadow: inset 0 0 0 1px`), so the text never shifts.
- `appearance=subtle`: transparent box, bottom-only 1px border, reveals on hover (`border/input`),
  focus (`border/focus`), invalid (`border/error`); square bottom corners. Mirror Text Field's subtle.
- **Reuse Text Field's semantic tokens** — do not create new tokens. Figma's `background/input/*` and
  `border/focused` naming has no counterpart here; map to `elevation/surface/raised/*` and
  `border/focus` (same intent, reuse-first per token governance).
- Do **not** implement `type=rich-inline` — it's an inline entity-tagging mode (press `/` → searchable
  grouped Dropdown Menu of entities → insert an inline navigational tag: a colored, icon-bearing chip
  linking to the entity), needing a new navigational-tag element and a contenteditable surface. A real
  feature for a dedicated pass; visually identical to `default` in the static mockup. Expose no `type`
  prop.
- No built-in label — pair with `<label htmlFor>`/`aria-label`. `aria-invalid` reflects `invalid`.

## Files

- `text-area.tsx`, `text-area.types.ts`, `text-area.module.css`, `index.ts`
- `TextArea.stories.tsx` (Playground, Variants, States, Resize, Content, EdgeCases), `TextArea.test.tsx`
- Docs: `text-area.md`, `-spec.md`, `-checklist.md`, `-prompt.md`, `.contract.json`, `.examples.json`,
  `text-area.mdx`
- Add to `llms.txt` (Molecules); regenerate the registry and exemplars.

## Verification

`npm run validate` clean; verify live in Storybook that geometry, states, subtle, and resize match
Figma, in light and dark.
