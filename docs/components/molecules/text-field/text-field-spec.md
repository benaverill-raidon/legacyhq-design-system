# Text Field

## Overview

### Purpose
Text Field lets a user write or edit a single line of free text.

### Description
Use Text Field for any short, single-line text entry - names, emails, search boxes, quantities.

### Tier
Molecule - its trailing slot composes a real Icon Button/Button, not just decoration around a
bare input, so it doesn't belong at the atom tier.

### Design Reference
- Figma Component: `text-field` (component set, node `1690:14129`, file `Components v1.0.0`)
- Variant axes: `size` (sm, md, lg) x `context` (default, inline) x `state` (default, hover, focus,
  typing, filled, autofill) x `isDisabled` (false, true) x `isInvalid` (false, true) = 48 variants
  (not fully crossed - `isInvalid` is only demonstrated on `filled`, `isDisabled` only on `default`;
  re-checked 2026-10-13)
- `state=autofill`: `context=default` layers `color/background/autofill/default` over
  `color/elevation/surface/raised/default` and keeps its `color/border/input` 1px stroke;
  `context=inline` has no fill or stroke, the same as inline `filled` (its fills were removed on
  2026-10-14, per design feedback). Code applies this when the native input matches `:autofill`,
  and also shows the tint on a focused inline field - see Design Decisions and Design Tokens below.
  The token is 16% opacity since 2026-10-14 (it was 8%).
- Component properties: `placeholderText` (TEXT), `value` (TEXT), `elemBeforeInput` (BOOLEAN),
  `elemAfterInput` (BOOLEAN), `slot <elemAfterInput>` (INSTANCE_SWAP) - `showCaret` and
  `placeholder` (BOOLEAN) exist only to drive Figma's own mockup between placeholder/value text and
  are not real component props (see Design Decisions below)
- `elemBeforeInput` and `elemAfterInput` are separate Figma components (added after the initial
  pass): `elemBeforeInput` has a `type` property of `icon | text`; `elemAfterInput` has a `type`
  property of `icon | button | label`. Confirmed directly from their node data, not assumed
  symmetric with the leading slot. The `label` case nests a real Label atom instance
  (tone=default, emphasis=subtle) for compact metadata/status after the input.

---

## Usage Guidelines

### Use When
- Collecting a single line of free-typed text (name, email, search term, quantity, ...)

### Do Not Use When
- The content spans multiple lines - there is no textarea mode
- The value should come from a fixed set of options - use Select
- A native input type already covers the need better (date, checkbox, etc.) - reach for the more
  specific control instead of a generic text field with custom validation

---

## Anatomy

```text
TextField
└─ div (bordered frame)
   ├─ span.before (optional, iconBefore - icon or text, always aria-hidden)
   ├─ span.leadingContent (optional, leadingContent - interactive in-frame content, not aria-hidden)
   ├─ input (native, flex: 1)
   └─ span.action (optional, iconAfter - icon, an interactive IconButton/Button, or a non-interactive Label pill, never forced aria-hidden)
```

### Structure Notes
- Single bordered frame wrapping the actual `<input>`
- The leading slot (`iconBefore`) is icon-or-text only, and is always decorative - it is always
  wrapped `aria-hidden`, matching Figma's `elemBeforeInput` component (`type: icon | text`)
- The trailing slot (`iconAfter`) is icon-or-action-or-label - matching Figma's `elemAfterInput`
  component (`type: icon | button | label`) - and is never forced `aria-hidden`, since it
  frequently holds a real focusable control (most commonly a clear action). The `label` case is
  non-interactive, like a Label pill for a unit or status tag.
- The optional `leadingContent` slot sits between `iconBefore` and the input, sharing the input's
  row. Unlike `iconBefore` it is not `aria-hidden` and may hold real controls - it exists so a
  token/multi-select field (Select) can render removable chips inside the frame without a second
  bordered frame. It is `flex: 0 1 auto` with `min-inline-size: 0` and `overflow: hidden`, so it
  shrinks and clips rather than pushing the input out of view, keeping the field single-line. Not
  derived from a Text Field Figma variant; omit it for an ordinary field.
- No label, no helper text, no error message - Figma's source component is the bare input frame
  only (see Design Decisions); wrap it in Field for those

---

## Design Decisions Beyond the Literal Figma Sample

Figma models six "state" values (`default`, `hover`, `focus`, `typing`, `filled`, `autofill`) as if
they were separate variants to choose between. Read against the actual bound tokens, they resolve
to native browser behavior, not real props:

- `hover` → `:hover`
- `focus` → an empty, focus input (`:focus-within` on the frame, `:placeholder-shown` still true
  on the input since there's no value yet)
- `typing` → a focused input that now has a value (`:focus-within` + `:placeholder-shown` no longer
  matching)
- `filled` → an unfocused input with a value (`:placeholder-shown` not matching)
- `autofill` → a value the browser filled in (`:autofill` on the input, read on the frame with
  `:has(.input:autofill)`)

None of this needs a `state` prop - it all falls out of native `:hover`, `:focus-within`,
`:placeholder-shown`, and `:autofill`, plus whatever `value`/`defaultValue` the consumer actually
passes. Likewise,
`showCaret` and `placeholder` (BOOLEAN) only exist in Figma to toggle its own mockup between
showing placeholder text and value text for documentation purposes - the real component has no
prop for either; a real native input already shows its own caret and switches between placeholder
and value automatically.

Figma's `context` axis (`default`, `inline`) is the `context` prop in the React API - the same name
and the same values. It replaces the earlier `appearance` prop (`default`/`subtle`/`inline`), which
is deprecated but still accepted: `subtle` and `inline` both map to `context="inline"`, `default` to
`context="default"`. The old code-only `inline` look (the same as `subtle` but without the hover
background) was merged into `context="inline"`, so a Key Value Pair inline field now gets Figma's
hover background too.

Figma's `isInvalid` variant is always shown with `strokeWeight: 2` (thicker than the resting 1px
border) even when not focused - confirmed directly from the node data, not assumed. The component
therefore always renders `invalid`'s thicker border while the invalid state is on, regardless of
focus - it is not a focus-only effect.

Figma's literal focus treatment thickens the frame's own border from 1px to 2px and swaps its color
to `--color-border-focus`. The focused-frame indicator directly replaces the resting border's
color - the exact same pattern `invalid` already uses (see above) - rather than adding an outline
ring around the existing border. (An earlier pass used an `outline` here specifically to avoid a
layout shift; per explicit design feedback, the border should replace `border-input` the same way
`invalid` does, not wrap it, so the outline approach was reverted.) `context="inline"` already
followed this "replace, don't wrap" pattern for its own focus indicator (a bottom-border color swap)
and needed no change.

Border *width* does not literally change to 2px, though, even though Figma's own treatment does:
an earlier pass changed the real `border-width` from `1px` to `var(--border-width-md)` (2px) on
`:focus-within` (and the same real change already existed on `invalid`), matching Figma directly -
but a real width change shrinks the content box on every side, including the left, which visibly
nudges the placeholder/value text and the typing caret to the right on every focus/blur or invalid
toggle. This was reported directly against the component from a side-by-side screenshot. Both
`:focus-within` and `invalid` now paint the extra thickness with
`box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm)) <color>` instead, layered directly against the real (constant) 1px
border - a box-shadow is pure paint with zero layout impact, so the frame reads as thicker without
the content box (or the text/caret inside it) ever resizing. This is the same technique
`context="inline"` uses for its own bottom-only version of this problem (see below).

Hover is suppressed once the field is focus/typing (`:focus-within`, or the pinned
`data-force-state='focus'` reference used for the static Storybook state) - hover should only ever
be visible on an inactive field, per explicit design feedback. This applies to both contexts.

Autofill follows Figma's `state=autofill` variants (re-checked 2026-10-13; inline updated
2026-10-14, per design feedback). On `context="default"` the frame's `background` layers
`--color-background-autofill-default` (a translucent brand tint) over
`--color-elevation-surface-raised-default`, keeping the resting stroke. The rule matches
`:has(.input:autofill)`, or the documentation-only `data-force-state='autofill'` pin, and skips a
disabled field. Figma shows autofill only at rest, but in a browser the value stays autofilled
while the person hovers, focuses, or gets an error on the field. Per explicit design feedback
(2026-10-14), code settles those combinations like this:

- **Hover replaces the tint.** The hover rules outrank the autofill rule and set the `background`
  shorthand, which clears the tint, so an autofilled field hovers exactly like any other. Focus and
  invalid change only the border, so the tint stays under them.
- **`context="inline"` stays chromeless at rest.** Once a suggestion is picked and the field is
  left, it looks like any other inline field, invalid included - as Figma's inline autofill
  variant does. It shows the tint (over the raised surface) only while focused, which Figma
  doesn't draw.

Browsers paint their own autofill fill and text color on the native input (Chrome's blue, Safari's
yellow) from their user-agent stylesheet with `!important`, which author CSS can't override. The
input's background is clipped to its text instead (`background-clip: text`), which leaves that fill
only under the glyphs, where the text covers it - so the frame shows through in every state without
matching its color. `-webkit-text-fill-color` and `caret-color` (`--color-content-default`, or
`--color-content-disabled` on a disabled input) replace the forced text color, and `filter: none`
clears the filter some Firefox versions use for the same highlight. Two other workarounds were
ruled out:

- A long `background-color` transition holds the fill off, but it needs a raw duration or delay,
  which the motion rules don't allow. Turning it off for reduced motion would bring the browser's
  fill back.
- An inset `box-shadow` in the frame color paints over the fill, but the frame color here changes
  with state: a translucent tint over a surface, the hover surface, or transparent on an inline
  field at rest. The shadow would have to follow every frame state.

The autofill rules add no transition. The frame's background change fades with `.root`'s existing
`background-color` transition, which the reduced-motion block already switches off.

`context="inline"`'s bottom corners are always square (`border-bottom-{left,right}-radius: 0`)
at every size, confirmed directly from Figma's per-corner radius data on the inline variants - only
the top two corners share `context="default"`'s standard radius. This is a per-corner override,
not a smaller uniform radius, since `context="default"` remains rounded on all four corners at
the same sizes.

`context="inline"` rests at the same `1px` bottom border-width `context="default"` uses at
rest, per explicit design feedback - an earlier pass instead reserved a constant `2px` (transparent
at rest) specifically to avoid any layout shift when `invalid`/focus reveal the border. That
reservation was reverted so both contexts share one resting width instead of `inline` being
special-cased.

Reverting the constant-2px reservation reintroduced the exact layout shift it was built to avoid:
changing the real `border-bottom-width` from `1px` to `2px` on focus/invalid shrinks the content box
by a pixel, which visibly nudges the vertically-centered placeholder/value text - reported directly
against this component from a side-by-side screenshot (the same problem, and the same fix, that
`context="default"`'s own focus/invalid needed - see above). `border-bottom-width` now stays a
constant `1px` in the box model at every state (rest, hover, focus, invalid) - focus and invalid
instead paint an extra pixel via `box-shadow: inset 0 calc(-1 * (var(--border-width-md) - var(--border-width-sm))) 0 0 <color>`, layered directly against
the real 1px border, with zero layout impact.

Hovering an `invalid` `context="inline"` field no longer resets the bottom border back to
`--color-border-input` - per explicit design feedback, the error border must stay visible through
hover, the same way `context="default"`'s hover (background-only, no border-color touch) never
masks `invalid` either. The hover rule that changes the bottom border color is scoped with
`:not([data-invalid='true'])` so it only applies to the non-invalid case; the hover rule that
changes background remains unscoped, since background hover feedback is still expected on an
invalid field.

`elemBeforeInput` (`iconBefore`) and `elemAfterInput` (`iconAfter`) are asymmetric in what they may
contain, confirmed directly from their separate Figma component definitions rather than assumed to
mirror each other:
- `elemBeforeInput`'s `type` property is `icon | text` - it is never an interactive control, so the
  React implementation always wraps it `aria-hidden`. The `text` case (e.g. a `$` currency prefix)
  is bound to fixed `body-lg` typography in Figma at every field size - it does not scale down with
  a `sm` field the way the input's own typography does.
- `elemAfterInput`'s `type` property is `icon | button | label` - it is frequently interactive
  (most commonly a clear action), so the React implementation never forces `aria-hidden` on this
  slot. When it's a clear/dismiss-style action, use a real `IconButton` with `appearance="subtle"`
  and `shape="square"` - confirmed from Figma's screenshot of the clear icon-button in its hover
  state - not a bare icon standing in for a button. The `label` case nests a real `Label` atom
  (`tone="default"`, `emphasis="subtle"`) for compact, non-interactive metadata/status after the
  input - confirmed directly from the nested instance's own component properties.

---

## Variants

### Size

| Size | Height | Padding inline (start / end) | Padding block | Gap | Radius | Typography |
|------|--------|-------------------------------|---------------|-----|--------|------------|
| sm | 32px (`--size-control-sm`) | `--spacing-sm` / `--spacing-xs` | `--spacing-075` | `--spacing-xs` | `--border-radius-lg` | `--typography-body-md-*` |
| md | 40px (`--size-control-md`) | `--spacing-sm` / `--spacing-sm` | `--spacing-sm` | `--spacing-075` | `--border-radius-lg` | `--typography-body-md-*` |
| lg | 48px (`--size-control-lg`) | `--spacing-md` / `--spacing-sm` | `--spacing-md` | `--spacing-sm` | `--border-radius-xl` | `--typography-body-lg-*` |

`sm` and `md` share the same typography (`body-md`) - confirmed directly from Figma's bound text
style on both, not an assumption. Only `lg` steps up to `body-lg`.

Inline padding is asymmetric at every size (the end side is tighter than the start side) so a
trailing icon/action sits closer to the field's edge - confirmed directly from Figma's per-side
padding values, not assumed symmetric with the original single-value pass. The gap between the
input and an adjacent icon/action also varies per size (4px/6px/8px) rather than a flat 6px at
every size - `--spacing-xs` (sm), `--spacing-075` (md, Figma's `spacing/075`), `--spacing-sm`
(lg).

### Context

| Context | Figma `context` | Description |
|---------|-----------------|--------------|
| default | default | Bordered box, rounded on all four corners, with a raised-surface background at rest |
| inline | inline | No border or background at rest. Hover shows the raised-hover background and a 1px bottom border; focus and invalid paint a 2px bottom line. Keeps normal padding, height, and top-corner radius; bottom corners always square. For a field inside a row - a search box, an inline-edit field, a Key Value Pair value. |

The deprecated `appearance` prop still works: `subtle` and `inline` map to `inline`, `default` to
`default`.

---

## Content Rules

### Supported Content
Any single-line text value appropriate to the native `type` in use.

- `iconBefore`: an icon from the generated icon set, or a short text prefix (e.g. `$`). Always
  decorative.
- `iconAfter`: an icon from the generated icon set, an interactive control - typically an
  `IconButton` (`appearance="subtle"`, `shape="square"`) for a clear/dismiss action, or a `Button`
  when the trailing action needs a text label - or a non-interactive `Label` pill for compact
  metadata/status (e.g. a unit or status tag).

### Content Length
No fixed limit - native `maxLength` applies if set.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| size | `'sm' \| 'md' \| 'lg'` | No | `'md'` |
| context | `'default' \| 'inline'` | No | `'default'` |
| appearance (deprecated) | `'default' \| 'subtle' \| 'inline'` | No | undefined |
| invalid | boolean | No | `false` |
| iconBefore | ReactNode | No | undefined |
| leadingContent | ReactNode | No | undefined |
| iconAfter | ReactNode | No | undefined |
| className | string | No | undefined |
| inputClassName | string | No | undefined |
| ...rest | `React.InputHTMLAttributes<HTMLInputElement>` (minus `size`) | No | - |

`disabled`, `placeholder`, `value`, `defaultValue`, `type`, `onChange`, `required`, `name`, `id`,
etc. are all the real native `<input>` attributes, forwarded directly - there is no bespoke
`isDisabled` or custom placeholder/value prop.

`appearance` is a deprecated alias for `context`, still accepted: `subtle` and `inline` map to
`context="inline"`, `default` to `context="default"`. An explicit `context` wins.

`iconBefore`/`iconAfter` are both typed as plain `React.ReactNode` - the asymmetry between "always
decorative" and "may be interactive" is enforced by the component's markup (only `iconBefore`'s
wrapper is `aria-hidden`), not by the type system, since both slots legitimately accept any
renderable content.

---

## Accessibility

### Keyboard Support
Native `<input>` keyboard behavior - Tab focuses it, typing works exactly as any text input would.
No custom keyboard handling is added. When `iconAfter` holds an interactive control (e.g. an
`IconButton`), Tab reaches it as its own separate stop after the input, exactly as it would for any
sibling button - Text Field does not manage focus order beyond native DOM order.

### ARIA

- `invalid` sets `aria-invalid="true"` on the input.
- `iconBefore` is always decorative (`aria-hidden`) - it never carries information the input's own
  accessible name doesn't already have, and it can never be interactive (Figma's `elemBeforeInput`
  is icon-or-text only).
- `iconAfter` is **not** forced `aria-hidden` - it may hold a real interactive control (Figma's
  `elemAfterInput` is icon-or-button). A plain decorative icon passed here already gets `aria-hidden`
  from the Icon primitive itself; an `IconButton`/`Button` passed here must remain focusable and
  keeps its own accessible name (e.g. `aria-label="Clear"`).
- Text Field does not manage labelling - pair it with a native `<label htmlFor>` pointing at the
  input's `id`, or pass `aria-label`/`aria-labelledby` directly, exactly as you would for a bare
  `<input>`.

---

## Design Tokens

### Colors

| State | Background | Border | Text |
|-------|-----------|--------|------|
| default | `--color-elevation-surface-raised-default` | `--color-border-input`, 1px | `--color-content-subtle` (placeholder) / `--color-content-default` (value) |
| hover (not focus) | `--color-elevation-surface-raised-hover` | `--color-border-input`, 1px | (unchanged) |
| focus/typing | (unchanged) | `--color-border-focus`, 1px + a matching inset box-shadow ring to look thicker, see Design Decisions | (unchanged) |
| invalid | (unchanged) | `--color-border-error`, 1px + a matching inset box-shadow ring | (unchanged) |
| disabled | `--color-background-disabled` | `--color-border-disabled` | `--color-content-disabled` |
| autofill (not hovered) | `--color-background-autofill-default` layered over `--color-elevation-surface-raised-default` | (unchanged - the resting stroke, or focus/invalid) | `--color-content-default` (`-webkit-text-fill-color`, replacing the browser's forced color) |

Hover only ever shows on an inactive field - once the field is focus/typing, the hover background
is suppressed regardless of pointer position, so focus/typing and hover styling never compete.
Hovering an autofilled field shows the ordinary hover row above - hover replaces the tint.

`context="inline"` shows the autofill tint only while focused. At rest
an autofilled inline field looks like any other inline field: transparent, no visible line.

`context="inline"` starts from a transparent background and border at rest, then uses the exact
same hover/focus/invalid tokens as `context="default"` once interacted with - the
`--color-elevation-surface-raised-hover` background plus a `--color-border-input` bottom border on
hover, and `--color-border-focus` / `--color-border-error` on the bottom edge only - confirmed
directly from Figma's bound variables on the inline variants, not assumed symmetry.

### Text selection
Selected text inside the input is tinted with `--color-content-highlight`, a translucent brand
`::selection` background shared with Text Area and Rich Text Area. Only the background is set; the
text color stays the browser default. `::selection` and `::-moz-selection` are separate rules,
because an engine drops a whole selector list that contains a pseudo-element it doesn't recognize.

### Sizing
See the Size table above.

---

## Behaviors

### Default
Renders a native `<input>` inside a bordered frame. All interaction states are native
(`:hover`, `:focus-within`, `:placeholder-shown`, `:autofill`, `:disabled`) except `invalid`, which
is a real boolean prop. The ref forwards to the `<input>`; `className` goes on the frame and every
other attribute on the input.

### Editable table cell
Inside a Table column with `cellAppearance="editable"`, Table provides `EditableCellContext`
(`primitives/editable-cell-context`) with the table's `size`. Text Field then overrides its own `size`
with the cell's size and forces `context="inline"`, whatever the caller passed, and sets
`data-editable-cell` on the frame. In that mode the frame is 64px tall (40px for an `sm` cell) with
`--spacing-lg` start padding, square corners while hovered or focused, a hover background of
`--color-background-neutral-overlay-bold-hover`, a bottom border that rests on
`--editable-cell-divider`, and the placeholder in `--color-content-default`. A click anywhere on the
cell's padding or glyphs focuses and clicks the input, unless it lands on an input, button, or link;
the trailing slot ignores pointer events except for a real button or link inside it. Popup content
resets the context, so a Text Field inside a popup opened from a cell is unaffected.

---

## Dependencies

### Uses
- Icon (primitive) - via `iconBefore`, or a decorative `iconAfter`
- Icon Button (atom) - the recommended real control for an interactive `iconAfter` clear/dismiss
  action (`appearance="subtle"`, `shape="square"`)
- Button (atom) - for an interactive `iconAfter` action that needs a text label
- Label (atom) - for a non-interactive `iconAfter` metadata/status pill

### Used By
- Forms
- Search boxes
- Inline-edit fields
- Field - with `context="inline"`, injects `context="inline"` into its control unless the control
  sets its own `context` (or a deprecated `appearance`)
- Date Picker and Time Picker - pass their own `context` straight to the Text Field
- Table - editable cells force `context="inline"`
- Menu - its search field uses `context="inline"`

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded colors, spacing, radius, or typography where a token exists
- No MUI dependency
- No Tailwind dependency
- Render a real `<input>` - never fake one with a styled non-form element
- Do not add a `state` prop - hover/focus/typing/filled/autofill all derive from native
  pseudo-classes and the input's own value
- Never force `aria-hidden` on `iconAfter` - it may hold a real interactive control

---

## QA Checklist

### Visual
- [ ] Matches Figma across size x context
- [ ] Hover, focus, invalid, and disabled states match Figma's bound tokens
- [ ] Focus/typing replaces the resting border color directly (like invalid), not an outline ring
      around it
- [ ] `context="default"` rests at 1px border-width at every state (rest, hover, focus, invalid) -
      focus/invalid look thicker via `box-shadow` only, never a real `border-width` change, so the
      input text and typing caret never shift horizontally
- [ ] Hover background never shows while the field is focused/typing
- [ ] `context="inline"` renders square bottom corners at every size
- [ ] `context="inline"` shows the raised-hover background and a 1px bottom border on hover
- [ ] `context="inline"` rests at the same 1px border-width as `context="default"`, at every
      state (rest, hover, focus, invalid) - focus/invalid look thicker via `box-shadow` only, never
      a real `border-bottom-width` change, so the input text never shifts vertically
- [ ] Hovering an invalid `context="inline"` field keeps the error border color, not
      `--color-border-input`
- [ ] Inline padding is asymmetric (tighter on the end side) at every size
- [ ] An autofilled `context="default"` field shows `--color-background-autofill-default` over the
      raised surface, with no browser autofill fill on the input; hover replaces the tint, focus and
      invalid keep it (check the pinned States story and a real autofill in Edge Cases)
- [ ] An autofilled `context="inline"` field is chromeless at rest and shows the tint only while
      focused
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] Renders a real native `<input>`
- [ ] size and context render correctly
- [ ] deprecated `appearance` values map to a context (`subtle`/`inline` → `inline`)
- [ ] invalid sets aria-invalid and the error border
- [ ] disabled prevents interaction and applies disabled tokens
- [ ] iconBefore/iconAfter render when provided
- [ ] iconAfter accepts a real interactive `IconButton`/`Button` and it stays clickable/focusable
- [ ] Placeholder vs. value text color follows `:placeholder-shown` automatically
- [ ] className and inputClassName both apply correctly

### Accessibility
- [ ] Works with a native `<label htmlFor>` pointing at the input's id
- [ ] aria-invalid reflects the invalid prop
- [ ] iconBefore is aria-hidden
- [ ] iconAfter is not forced aria-hidden, and an interactive control placed there remains reachable
      by keyboard

---

## Known Limitations
- No multi-line mode - use Text Area.
- No integrated label, helper text, or error message - Figma's source component doesn't include
  them; wrap it in Field.
