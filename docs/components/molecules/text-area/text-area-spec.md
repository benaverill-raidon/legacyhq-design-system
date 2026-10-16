# Text Area Component Spec

## Overview

Text Area is a real native `<textarea>` in the same bordered frame as [Text Field](../text-field/text-field-spec.md),
for multi-line free text. It shares Text Field's `size`, `context`, `invalid`, and state treatment
token-for-token, and adds a `resize` axis. The frame styling lives on a wrapper `<div>` (matching
Text Field's pattern) so it can host an optional trailing icon/action slot (`iconAfter`).

## Anatomy

```txt
<div.root>       ← bordered frame (border, background, radius, padding); display: flex; align-items: flex-start
  <textarea>     ← transparent, borderless child (flex: 1 1 auto); resize: inherit
  <span.action>  ← optional trailing icon/action slot (iconAfter); flex: 0 0 auto
</div.root>
```

The wrapper `<div>` gets the same frame styling Text Field's root div uses. Focus detection uses
`:focus-within` on the wrapper. Resize still works: `resize: inherit` on the textarea, with
`overflow: auto` on the wrapper's resize_* classes (CSS requires overflow != visible for resize
to work on a div). The ref forwards to the `<textarea>`, not the wrapper.

## Public API

```ts
type TextAreaSize = 'sm' | 'md' | 'lg';
type TextAreaContext = 'default' | 'inline';
/** @deprecated Use TextAreaContext: subtle and inline are both inline. */
type TextAreaAppearance = 'default' | 'subtle' | 'inline';
type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextAreaSize;
  context?: TextAreaContext;
  /** @deprecated Use context: subtle and inline map to context="inline". */
  appearance?: TextAreaAppearance;
  invalid?: boolean;
  resize?: TextAreaResize;
  autoResize?: boolean;
  maxRows?: number;
  iconAfter?: React.ReactNode;
  className?: string;
}
```

The ref forwards to the `<textarea>` (not the wrapper). Every native textarea attribute (`value`,
`defaultValue`, `placeholder`, `rows`, `maxLength`, `onChange`, `name`, `required`, `readOnly`,
`wrap`, ...) passes straight through.

`iconAfter` renders a trailing icon or interactive control (e.g. an edit pencil IconButton) after
the textarea inside the wrapper. The slot is not `aria-hidden` — it may hold a real focusable action.
`context="inline"` combined with `iconAfter` is the standard pattern for embedding inside a Key
Value Pair.

## Defaults

```txt
size: md
context: default
invalid: false
resize: vertical
autoResize: false
maxRows: 6
```

`context` mirrors Text Field and Figma's `context` axis (`default` / `inline`) - the same name and
values in all three. The older `appearance` prop is deprecated but still accepted: `subtle` and
`inline` both map to `context="inline"`, `default` to `context="default"`.

## Geometry

Measured directly from Figma's bound variables, per size:

| | md | lg |
|---|---|---|
| padding-block | `--spacing-sm` (8) | `--spacing-md` (12) |
| padding-inline | `--spacing-sm` (8) | `--spacing-md` (12) |
| radius | `--border-radius-lg` (8) | `--border-radius-xl` (12) |
| font | `body-md` (14/24) | `body-lg` (16/24) |

Code also supports `sm` for compact key/value rows: body-md typography, `--spacing-075` block
padding, and the md inline padding/radius. Auto-resize uses `--size-control-sm/md/lg` for the
minimum frame height and adjusts block padding to fit one line within that height.

## States and tokens

Frame tokens by state (`context=default`), verified against Figma and reused from Text Field:

| state | background | border | painted width |
|---|---|---|---|
| default | `elevation/surface/raised/default` | `border/input` | 1px |
| hover | `elevation/surface/raised/hover` | `border/input` | 1px |
| focus | `elevation/surface/raised/default` | `border/focus` | 2px (box-shadow) |
| invalid | `elevation/surface/raised/default` | `border/error` | 2px (box-shadow) |
| disabled | `background/disabled` | `border/disabled` | 1px |
| autofill (not hovered) | `background/autofill/default` over `elevation/surface/raised/default` | `border/input` (or focus/invalid) | 1px |

Focus and invalid keep the real `border-width` at 1px and paint the extra pixel with
`box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm)) <color>` - the same technique Text Field uses, so the multi-line text
never shifts by a pixel. Hover tint is suppressed once focused.

**Autofill** follows Figma's `state=autofill` variants (re-checked 2026-10-13, both contexts) and
matches Text Field's treatment exactly. The frame's `background` layers
`--color-background-autofill-default` over `--color-elevation-surface-raised-default` when the
textarea matches `:autofill` (`.root:has(.textarea:autofill)`), or under the documentation-only
`data-force-state='autofill'` pin, except when disabled. Each context keeps its resting stroke. Per
explicit design feedback (2026-10-14), hover replaces the tint (the hover rules outrank the autofill
rule and set the `background` shorthand), while focus and invalid keep it; and `context=inline`
stays chromeless at rest - as Figma's inline autofill variants do since their fills were removed
on 2026-10-14 - showing the tint only while focused. The token is 16% opacity since 2026-10-14 (it
was 8%). The browser's own
`!important` autofill fill on the textarea is hidden with `background-clip: text`, and
`-webkit-text-fill-color` and `caret-color`
replace its forced text color. There's no transition: a long-transition workaround would need a raw
timing the motion rules don't allow. See Text Field's spec for the full reasoning.

**`context=inline`** (Figma's `context=inline`) is chromeless at rest - no visible border or
background, with a transparent bottom-only 1px border. Hover shows the raised-surface hover
background (`elevation/surface/raised/hover`) plus the bottom border in `border/input`; focus shows a
bottom-only 2px focus line (`border/focus` on the bottom border, +1px via a bottom-only inset
box-shadow); invalid shows a bottom-only error border (`border/error`) the same way; disabled stays
transparent. Bottom corners are square; top corners keep the size's radius - mirroring Text Field's
`context="inline"`. Autofilled, it stays chromeless at rest and shows the raised surface with the
autofill tint only while focused. For a field inside a row, such as Key
Value Pair wrapped in Inline Edit.

**Text selection** is tinted with `--color-content-highlight`, the translucent brand `::selection`
background shared with Text Field and Rich Text Area. Only the background is set; the text color is
left alone. `::selection` and `::-moz-selection` are separate rules, as in Text Field.

### Token naming note

Figma's text-area binds a newer `background/input/*` (default/hovered/pressed) and `border/focused`
naming that has no counterpart in this token build. Those map one-to-one onto the
`elevation/surface/raised/*` and `border/focus` semantic tokens Text Field already consumes, so Text
Area reuses those (reuse-first, per token governance) rather than introducing unbacked tokens. One
deliberate consequence: Figma tints the fill on focus (`background/input/pressed`); code keeps the
resting fill on focus instead, matching Text Field's established behavior.

## Resizing

`resize` maps to the CSS `resize` property (`none`/`vertical`/`horizontal`/`both`), defaulting to
`vertical`. A disabled field forces `resize: none`. Initial height comes from the native `rows`
attribute unless `autoResize` is enabled.

`autoResize` opts into measuring existing and entered content, growing and shrinking in normal
document flow. The minimum height matches TextField for the selected size. `maxRows` defaults to
six text lines, with vertical scrolling for additional content. Auto-resize overrides `rows` and
manual resizing, and remeasures on controlled updates, font readiness, and width changes.
Key/value examples enable it with `InlineEdit actionPlacement="end" actionAlignment="start"`.

## `type=rich-inline`: implemented as RichTextArea

The second Figma `type`, `rich-inline`, is an inline entity-tagging mode, not rich-text formatting:
the user presses `/` to open a searchable, grouped picker of entities to link, and each choice is
inserted inline as a **navigational tag** - a colored, icon-bearing chip linking to that entity. It
looks identical to `default` in the static mockup; the entire difference is behavior.

It ships as **[RichTextArea](../rich-text-area/rich-text-area.md)** (`molecules/text-area/rich`),
composing the Menu organism as the picker and the Tag atom as the inserted tag. It reuses this
component's frame token-for-token.

It is a separate component rather than a `type` prop because the two share only that frame:

- Text Area's value is a `string` on a native `<textarea>`; RichTextArea's is a structured node array
  on a `contenteditable` surface.
- RichTextArea needs `onSearch`, `recents`, and an entity-to-tone config that mean nothing here.
- A single component would carry two disjoint prop sets and two disjoint value types under one name.

So Text Area still exposes no `type` prop, and the illegal state cannot be requested.

## Accessibility

- A native `<textarea>` (role `textbox`, multiline) - all native keyboard/scroll/wrap behavior for
  free.
- No built-in label: pair with `<label htmlFor>` or `aria-label`.
- `aria-invalid` reflects `invalid`; disabled uses the native attribute (out of tab order,
  non-editable). The frame's focus border is the focus affordance.

## Tests

```txt
renders a native textarea
uses the default size, context, and resize
applies a selected size / context / resize option
maps the deprecated appearance values to a context
sets aria-invalid and data-invalid when invalid (and not by default)
disables the textarea and marks it disabled
applies className to the wrapper
forwards native props (rows, placeholder, maxLength, onChange)
forwards the ref to the native textarea
supports data-force-state for documentation
paints focus/invalid via box-shadow, not a border-width change
suppresses the hover background once focused
reuses Text Field semantic tokens for surface/border/radius
context=inline rests at a 1px bottom-only border; focus/invalid paint via box-shadow
disables the resize grip on a disabled field
renders iconAfter when provided
does not render the action slot when iconAfter is absent
context=inline is chromeless at rest, with Figma's hover fill and bottom-only states
autofill: layers the autofill token over the raised surface
autofill: shows the tint on context=default whenever autofilled or pinned, except when disabled
autofill: keeps context=inline chromeless at rest (tint only while focused)
autofill: keeps each context's resting stroke
autofill: lets hover replace the tint (hover rules set the background shorthand)
autofill: hides the browser's own fill by clipping the textarea's background to its text
autofill: adds no motion of its own
autofill: pins the state on the wrapper for documentation
```
