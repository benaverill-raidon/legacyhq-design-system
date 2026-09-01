# Text Area Component Spec

## Overview

Text Area is a real native `<textarea>` in the same bordered frame as [Text Field](../text-field/text-field-spec.md),
for multi-line free text. It shares Text Field's `size`, `appearance`, `invalid`, and state treatment
token-for-token, and adds a `resize` axis. The frame styling lives directly on the `<textarea>` (no
wrapper element) because Text Area composes no icon slots.

## Anatomy

```txt
<textarea>  ← the frame IS the textarea (border, background, radius, padding on the element itself)
  the text  ← native multi-line content; placeholder at content/subtle
  ⌟ resize grip  ← native browser affordance, controlled by the `resize` property
```

No wrapper `<div>`, no leading/trailing slots. Figma's own text-area is a single `Container` frame
holding the text, and the visual frame (fill/border/radius) is bound on the component node itself.

## Public API

```ts
type TextAreaSize = 'md' | 'lg';
type TextAreaAppearance = 'default' | 'subtle';
type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextAreaSize;
  appearance?: TextAreaAppearance;
  invalid?: boolean;
  resize?: TextAreaResize;
  className?: string;
}
```

The ref forwards to the `<textarea>`. Every native textarea attribute (`value`, `defaultValue`,
`placeholder`, `rows`, `maxLength`, `onChange`, `name`, `required`, `readOnly`, `wrap`, ...) passes
straight through.

## Defaults

```txt
size: md
appearance: default
invalid: false
resize: vertical
```

`appearance` mirrors Text Field (Figma names the axis `tone`); the code uses `appearance` so the two
siblings share one vocabulary.

## Geometry

Measured directly from Figma's bound variables, per size:

| | md | lg |
|---|---|---|
| padding-block | `--spacing-sm` (8) | `--spacing-md` (12) |
| padding-inline | `--spacing-sm` (8) | `--spacing-md` (12) |
| radius | `--border-radius-lg` (8) | `--border-radius-xl` (12) |
| font | `body-md` (14/24) | `body-lg` (16/24) |

The `sm` size was removed - it read almost identically to md - so md is now the smaller of the two,
and its values seed the base `.textarea` rule. Otherwise identical to Text Field's size mapping.

## States and tokens

Frame tokens by state (`appearance=default`), verified against Figma and reused from Text Field:

| state | background | border | painted width |
|---|---|---|---|
| default | `elevation/surface/raised/default` | `border/input` | 1px |
| hover | `elevation/surface/raised/hover` | `border/input` | 1px |
| focus | `elevation/surface/raised/default` | `border/focus` | 2px (box-shadow) |
| invalid | `elevation/surface/raised/default` | `border/error` | 2px (box-shadow) |
| disabled | `background/disabled` | `border/disabled` | 1px |

Focus and invalid keep the real `border-width` at 1px and paint the extra pixel with
`box-shadow: inset 0 0 0 1px <color>` - the same technique Text Field uses, so the multi-line text
never shifts by a pixel. Hover tint is suppressed once focused.

**`appearance=subtle`** is transparent at rest with a bottom-only 1px border, revealing on hover
(`border/input`), focus (`border/focus`, +1px via box-shadow), and invalid (`border/error`). Bottom
corners are square; top corners keep the size's radius - mirroring Text Field's subtle appearance.

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
attribute; there is no auto-resize-to-content in this version.

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
uses the default size, appearance, and resize
applies a selected size / appearance / resize option
sets aria-invalid and data-invalid when invalid (and not by default)
disables the textarea and marks it disabled
applies className to the textarea
forwards native props (rows, placeholder, maxLength, onChange)
forwards the ref to the native textarea
supports data-force-state for documentation
paints focus/invalid via box-shadow, not a border-width change
suppresses the hover background once focused
reuses Text Field semantic tokens for surface/border/radius
subtle rests at a 1px bottom-only border; focus/invalid paint via box-shadow
disables the resize grip on a disabled field
```

## Future considerations

- The `type=rich-inline` inline entity-tagging mode (slash-command searchable dropdown + inline
  navigational tags), per "Not implemented" above.
- Optional auto-resize (grow-with-content).
- A shared Form Field wrapper (label + control + helper/error) for both Text Field and Text Area.
