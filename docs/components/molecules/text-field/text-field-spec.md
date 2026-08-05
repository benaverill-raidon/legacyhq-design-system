# Text Field

## Overview

### Purpose
Text Field lets a user write or edit a single line of free text.

### Description
Use Text Field for any short, single-line text entry - names, emails, search boxes, quantities.

### Category
Molecule - its trailing slot composes a real Icon Button/Button, not just decoration around a
bare input, so it doesn't belong at the atom tier.

### Design Reference
- Figma Component: `text-field` (component set, node `1690:14129`, file `Components v1.0.0`)
- Variant axes: `size` (sm, md, lg) x `tone` (standard, subtle) x `state` (default, hover, focus,
  typing, filled) x `isDisabled` (false, true) x `isInvalid` (false, true) = 42 variants (not fully
  crossed - `isInvalid` is only demonstrated on `filled`, `isDisabled` only on `default`)
- Component properties: `placeholderText` (TEXT), `value` (TEXT), `elemBeforeInput` (BOOLEAN),
  `elemAfterInput` (BOOLEAN), `slot <elemAfterInput>` (INSTANCE_SWAP) - `showCaret` and
  `placeholder` (BOOLEAN) exist only to drive Figma's own mockup between placeholder/value text and
  are not real component props (see Design Decisions below)
- `elemBeforeInput` and `elemAfterInput` are separate Figma components (added after the initial
  pass): `elemBeforeInput` has a `type` property of `icon | text`; `elemAfterInput` has a `type`
  property of `icon-button | button`. Confirmed directly from their node data, not assumed
  symmetric with the leading slot.

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
   ├─ input (native, flex: 1)
   └─ span.action (optional, iconAfter - icon or an interactive IconButton/Button, never forced aria-hidden)
```

### Structure Notes
- Single bordered frame wrapping the actual `<input>`
- The leading slot (`iconBefore`) is icon-or-text only, and is always decorative - it is always
  wrapped `aria-hidden`, matching Figma's `elemBeforeInput` component (`type: icon | text`)
- The trailing slot (`iconAfter`) is icon-or-action - matching Figma's `elemAfterInput` component
  (`type: icon-button | button`) - and is never forced `aria-hidden`, since it frequently holds a
  real focusable control (most commonly a clear action)
- No label, no helper text, no error message - Figma's source component is the bare input frame
  only (see Design Decisions)

---

## Design Decisions Beyond the Literal Figma Sample

Figma models five "state" values (`default`, `hover`, `focus`, `typing`, `filled`) as if they were
separate variants to choose between. Read against the actual bound tokens, they resolve to native
browser behavior, not real props:

- `hover` → `:hover`
- `focus` → an empty, focused input (`:focus-within` on the frame, `:placeholder-shown` still true
  on the input since there's no value yet)
- `typing` → a focused input that now has a value (`:focus-within` + `:placeholder-shown` no longer
  matching)
- `filled` → an unfocused input with a value (`:placeholder-shown` not matching)

None of this needs a `state` prop - it all falls out of native `:hover`, `:focus-within`, and
`:placeholder-shown`, plus whatever `value`/`defaultValue` the consumer actually passes. Likewise,
`showCaret` and `placeholder` (BOOLEAN) only exist in Figma to toggle its own mockup between
showing placeholder text and value text for documentation purposes - the real component has no
prop for either; a real native input already shows its own caret and switches between placeholder
and value automatically.

Figma's `tone` axis (`standard`, `subtle`) is renamed to `appearance` (`default`, `subtle`) in the
React API, matching this design system's existing convention of naming the visual-weight axis
`appearance` (see Button) - Figma's `tone` here is a pure visual-weight distinction (bordered box
vs. borderless-until-interacted), not a semantic-meaning axis, so `tone` would be the wrong word for
it in this codebase's vocabulary. `standard` is renamed to `default` to match the `default`/`subtle`
vocabulary Button and Icon Button already use for the same two-value shape.

Figma's `isInvalid` variant is always shown with `strokeWeight: 2` (thicker than the resting 1px
border) even when not focused - confirmed directly from the node data, not assumed. The component
therefore always renders `invalid`'s thicker border while the invalid state is on, regardless of
focus - it is not a focus-only effect.

Figma's literal focus treatment thickens the frame's own border from 1px to 2px and swaps its color
to `--color-border-focused`. The focused-frame indicator directly replaces the resting border's
color - the exact same pattern `invalid` already uses (see above) - rather than adding an outline
ring around the existing border. (An earlier pass used an `outline` here specifically to avoid a
layout shift; per explicit design feedback, the border should replace `border-input` the same way
`invalid` does, not wrap it, so the outline approach was reverted.) `appearance="subtle"` already
followed this "replace, don't wrap" pattern for its own focus indicator (a bottom-border color swap)
and needed no change.

Border *width* does not literally change to 2px, though, even though Figma's own treatment does:
an earlier pass changed the real `border-width` from `1px` to `var(--border-width-md)` (2px) on
`:focus-within` (and the same real change already existed on `invalid`), matching Figma directly -
but a real width change shrinks the content box on every side, including the left, which visibly
nudges the placeholder/value text and the typing caret to the right on every focus/blur or invalid
toggle. This was reported directly against the component from a side-by-side screenshot. Both
`:focus-within` and `invalid` now paint the extra thickness with
`box-shadow: inset 0 0 0 1px <color>` instead, layered directly against the real (constant) 1px
border - a box-shadow is pure paint with zero layout impact, so the frame reads as thicker without
the content box (or the text/caret inside it) ever resizing. This is the same technique
`appearance="subtle"` uses for its own bottom-only version of this problem (see below).

Hover is suppressed once the field is focused/typing (`:focus-within`, or the pinned
`data-force-state='focus'` reference used for the static Storybook state) - hover should only ever
be visible on an inactive field, per explicit design feedback. This applies to both appearances.

`appearance="subtle"`'s bottom corners are always square (`border-bottom-{left,right}-radius: 0`)
at every size, confirmed directly from Figma's per-corner radius data on the subtle variants - only
the top two corners share `appearance="default"`'s standard radius. This is a per-corner override,
not a smaller uniform radius, since `appearance="default"` remains rounded on all four corners at
the same sizes.

`appearance="subtle"` rests at the same `1px` bottom border-width `appearance="default"` uses at
rest, per explicit design feedback - an earlier pass instead reserved a constant `2px` (transparent
at rest) specifically to avoid any layout shift when `invalid`/focus reveal the border. That
reservation was reverted so both appearances share one resting width instead of `subtle` being
special-cased.

Reverting the constant-2px reservation reintroduced the exact layout shift it was built to avoid:
changing the real `border-bottom-width` from `1px` to `2px` on focus/invalid shrinks the content box
by a pixel, which visibly nudges the vertically-centered placeholder/value text - reported directly
against this component from a side-by-side screenshot (the same problem, and the same fix, that
`appearance="default"`'s own focus/invalid needed - see above). `border-bottom-width` now stays a
constant `1px` in the box model at every state (rest, hover, focus, invalid) - focus and invalid
instead paint an extra pixel via `box-shadow: inset 0 -1px 0 0 <color>`, layered directly against
the real 1px border, with zero layout impact.

Hovering an `invalid` `appearance="subtle"` field no longer resets the bottom border back to
`--color-border-input` - per explicit design feedback, the error border must stay visible through
hover, the same way `appearance="default"`'s hover (background-only, no border-color touch) never
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
- `elemAfterInput`'s `type` property is `icon-button | button` - it is frequently interactive
  (most commonly a clear action), so the React implementation never forces `aria-hidden` on this
  slot. When it's a clear/dismiss-style action, use a real `IconButton` with `appearance="subtle"`
  and `shape="square"` - confirmed from Figma's screenshot of the clear icon-button in its hover
  state - not a bare icon standing in for a button.

---

## Variants

### Size

| Size | Height | Padding inline (start / end) | Padding block | Gap | Radius | Typography |
|------|--------|-------------------------------|---------------|-----|--------|------------|
| sm | 32px (`--size-control-sm`) | `--spacing-sm` / `--spacing-xs` | `--measurement-6` | `--spacing-xs` | `--border-radius-lg` | `--typography-body-md-*` |
| md | 40px (`--size-control-md`) | `--spacing-sm` / `--spacing-sm` | `--spacing-sm` | `--measurement-6` | `--border-radius-lg` | `--typography-body-md-*` |
| lg | 48px (`--size-control-lg`) | `--spacing-md` / `--spacing-sm` | `--spacing-md` | `--spacing-sm` | `--border-radius-xl` | `--typography-body-lg-*` |

`sm` and `md` share the same typography (`body-md`) - confirmed directly from Figma's bound text
style on both, not an assumption. Only `lg` steps up to `body-lg`.

Inline padding is asymmetric at every size (the end side is tighter than the start side) so a
trailing icon/action sits closer to the field's edge - confirmed directly from Figma's per-side
padding values, not assumed symmetric with the original single-value pass. The gap between the
input and an adjacent icon/action also varies per size (4px/6px/8px) rather than a flat 6px at
every size - `--spacing-xs` (sm), `--measurement-6` (md, Figma's `spacing/075`), `--spacing-sm`
(lg). There is no semantic spacing token for the 6px value yet, so it falls back to the raw
primitive directly, the same documented gap Toggle Button already has for its own icon gap.

### Appearance

| Appearance | Figma `tone` | Description |
|------------|--------------|--------------|
| default | standard | Bordered box, rounded on all four corners, with a raised-surface background at rest |
| subtle | subtle | No visible border or background until hover, focus, or invalid; bottom corners always square |

---

## Content Rules

### Supported Content
Any single-line text value appropriate to the native `type` in use.

- `iconBefore`: an icon from the generated icon set, or a short text prefix (e.g. `$`). Always
  decorative.
- `iconAfter`: an icon from the generated icon set, or an interactive control - typically an
  `IconButton` (`appearance="subtle"`, `shape="square"`) for a clear/dismiss action, or a `Button`
  when the trailing action needs a text label.

### Content Length
No fixed limit - native `maxLength` applies if set.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| size | `'sm' \| 'md' \| 'lg'` | No | `'md'` |
| appearance | `'default' \| 'subtle'` | No | `'default'` |
| invalid | boolean | No | `false` |
| iconBefore | ReactNode | No | undefined |
| iconAfter | ReactNode | No | undefined |
| className | string | No | undefined |
| inputClassName | string | No | undefined |
| ...rest | `React.InputHTMLAttributes<HTMLInputElement>` (minus `size`) | No | - |

`disabled`, `placeholder`, `value`, `defaultValue`, `type`, `onChange`, `required`, `name`, `id`,
etc. are all the real native `<input>` attributes, forwarded directly - there is no bespoke
`isDisabled` or custom placeholder/value prop.

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
| hover (not focused) | `--color-elevation-surface-raised-hovered` | `--color-border-input`, 1px | (unchanged) |
| focus/typing | (unchanged) | `--color-border-focused`, 1px + a matching inset box-shadow ring to look thicker, see Design Decisions | (unchanged) |
| invalid | (unchanged) | `--color-border-error`, 1px + a matching inset box-shadow ring | (unchanged) |
| disabled | `--color-background-disabled` | `--color-border-disabled` | `--color-content-disabled` |

Hover only ever shows on an inactive field - once the field is focused/typing, the hover background
is suppressed regardless of pointer position, so focus/typing and hover styling never compete.

`appearance="subtle"` starts from a transparent background and border at rest, then uses the exact
same hover/focus/invalid tokens as `appearance="default"` once interacted with - confirmed directly
from Figma's bound variables on the subtle variants, not assumed symmetry.

### Sizing
See the Size table above.

---

## Behaviors

### Default
Renders a native `<input>` inside a bordered frame. All interaction states are native
(`:hover`, `:focus-within`, `:placeholder-shown`, `:disabled`) except `invalid`, which is a real
boolean prop.

---

## Dependencies

### Uses
- Icon (primitive) - via `iconBefore`, or a decorative `iconAfter`
- Icon Button (atom) - the recommended real control for an interactive `iconAfter` clear/dismiss
  action (`appearance="subtle"`, `shape="square"`)
- Button (atom) - for an interactive `iconAfter` action that needs a text label

### Used By
- Forms
- Search boxes
- Inline-edit fields

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
- Do not add a `state` prop - hover/focus/typing/filled all derive from native pseudo-classes and
  the input's own value
- Never force `aria-hidden` on `iconAfter` - it may hold a real interactive control

---

## QA Checklist

### Visual
- [ ] Matches Figma across size x appearance
- [ ] Hover, focus, invalid, and disabled states match Figma's bound tokens
- [ ] Focus/typing replaces the resting border color directly (like invalid), not an outline ring
      around it
- [ ] `appearance="default"` rests at 1px border-width at every state (rest, hover, focus, invalid) -
      focus/invalid look thicker via `box-shadow` only, never a real `border-width` change, so the
      input text and typing caret never shift horizontally
- [ ] Hover background never shows while the field is focused/typing
- [ ] `appearance="subtle"` renders square bottom corners at every size
- [ ] `appearance="subtle"` rests at the same 1px border-width as `appearance="default"`, at every
      state (rest, hover, focus, invalid) - focus/invalid look thicker via `box-shadow` only, never
      a real `border-bottom-width` change, so the input text never shifts vertically
- [ ] Hovering an invalid `appearance="subtle"` field keeps the error border color, not
      `--color-border-input`
- [ ] Inline padding is asymmetric (tighter on the end side) at every size
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] Renders a real native `<input>`
- [ ] size and appearance render correctly
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
- No multi-line (textarea) mode.
- No integrated label, helper text, or error message - Figma's source component doesn't include
  them; see "Future Enhancements."
- `--measurement-6` (Figma's `spacing/075`) has no semantic spacing token yet, so it's consumed
  directly - the same documented gap Toggle Button already has.

## Future Enhancements
- A "Form Field" molecule composing a label, this input, and helper/error text
- A textarea variant if a real multi-line use case emerges
