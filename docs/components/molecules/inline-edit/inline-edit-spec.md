# Inline Edit

## Overview

### Purpose
Inline Edit lets a value switch between a read display and an editable control in place, with an
explicit confirm/cancel step.

### Description
Use Inline Edit to make a single displayed value directly editable on the same spot on the page,
rather than always showing an open input or requiring a separate form/dialog.

### Category
Molecule

### Design Reference
- Figma Component: `inline-edit` (component set, node `2067:94618`, file `Components v1.0.0`)
- Variant axis: `state` (`default`, `edit`) = 2 variants
- Component properties: `slot` (SLOT - accepts `text-field`, `select`, `time-picker`,
  `date-picker`, `date-time-picker`, or the generic `code-parts/<field>` placeholder),
  `actionButtons` (BOOLEAN, default `true`)
- `state=default` renders nothing but the empty `slot` - no read-only text, no pencil/edit icon, no
  frame chrome of its own (fill opacity `0`). `state=edit` renders the same `slot` plus a trailing
  `button-group` (a cancel/close icon-button then a confirm/check icon-button, `size=sm`,
  `shape=square`, `tone=default`), confirmed directly from a screenshot of both variants -
  `state=default` is visually blank, `state=edit` shows only the icon-button pair aligned to the
  trailing edge with the slot's (empty) space to its start.

---

## Usage Guidelines

### Use When
- A single value (a name, a title, a quantity, a date) should be editable directly where it's
  displayed
- The edit is simple enough to fit in the same space the read value occupies

### Do Not Use When
- Multiple related fields need to be edited together - use a real form
- The edit needs its own dedicated space (a lot of fields, a multi-step flow) - use a dialog or a
  separate screen instead

---

## Anatomy

```text
InlineEdit
└─ div (root, column layout, no visual chrome of its own)
   ├─ div.content (full width, holds the cloned child - read-only or editable depending on state)
   └─ span.actions (optional, only once editing has started && actionButtons; below content,
      right-aligned)
      ├─ IconButton (cancel/close)
      └─ IconButton (confirm/check)
```

### Structure Notes
- Single root `div`, transparent background and border - Inline Edit owns no color/border tokens of
  its own; every pixel of read/edit-mode visual treatment comes from the cloned `children`
- `children` is a single element, cloned with different props depending on state - not two separate
  elements the parent swaps between
- The confirm/cancel action pair renders only once editing has started, and only when
  `actionButtons` is not `false`

---

## Design Decisions Beyond the Literal Figma Sample

Figma's `state` variant axis (`default`, `edit`) is not implemented as a `state` prop or an
`isEditing` prop - editing state is owned entirely inside the component (`React.useState`), started
by focusing/clicking the field. Two earlier passes considered exposing `isEditing` as an
externally-controlled prop; both were reverted after explicit design feedback: every real use case
starts read-only and begins editing on click, so there is no scenario worth modeling where a
consumer would want to render the confirm/cancel buttons before the field is interacted with.

Figma's literal `state=edit` layout puts the action buttons trailing in the *same row* as the field,
which means the field has to shrink to make room for them once editing starts. Per explicit design
feedback, this implementation instead stacks the action row *below* the field (`flex-direction:
column`, action row `align-self: flex-end` to stay anchored to the trailing/right edge) - the field
keeps its full width whether or not it's being edited, and the layout never shifts the field's own
size when the action buttons appear.

Figma's `state=default` variant contains no read-mode UI at all - not even a text value or an edit
trigger. Rather than invent a separate one, Inline Edit clones the *same* single child for both
states via `React.cloneElement`: a read-only clone (`readOnly`, showing `value`, starting editing
on `onFocus`) and an editable clone (showing the in-progress draft, tracking `onChange`). Cloning the
same element - rather than swapping between two different elements - means the underlying DOM node
persists across the read→edit transition, so focus is never lost when editing starts.

Inline Edit's outer `value` contract mirrors `TextField`'s own `value`/`onChange` pattern: the
parent supplies the last confirmed value and receives it back via `onConfirm` only when the user
commits an edit, not on every keystroke - matching the explicit instruction that confirm should
"change to what is input during that edit session," and cancel should "revert to the last confirmed
input." Inline Edit owns the transient in-progress draft internally; the parent owns the confirmed
`value`, the same "parent owns confirmed state" precedent `ToggleButton.isSelected` already
established in this system.

`Enter`-to-confirm and `Escape`-to-cancel are added on top of the literal Figma sample (which only
shows the two icon buttons) as a deliberate, explicit addition - standard inline-edit UX, and useful
even when `actionButtons={false}` hides the visible buttons (the only remaining way to confirm/cancel
without wiring a separate control). `Enter` calls `event.preventDefault()` in addition to invoking
`onConfirm`, so an editable control nested inside a native `<form>` doesn't also trigger an
accidental form submission. Both keys also blur the field afterward, deselecting it the same way
clicking the confirm/cancel buttons already does (moving focus off the field, rather than leaving it
focused with the now-committed-or-reverted text still selected) - this reuses the same
`mousedown`-set ref flag the action buttons use, since blurring synchronously inside the key handler
would otherwise re-enter the blur-to-confirm handler with a stale (still-editing) closure and
double-fire confirm.

Clicking (or Tab-ing) away from the field while editing - anywhere other than the cancel/confirm
buttons themselves - commits the draft, the same as clicking confirm, per explicit design feedback:
"if I activate the text-field, then click off (not on cancel/confirm) it should work just like
clicking confirm." This is implemented as an `onBlur` handler on the root: if the element about to
receive focus (`event.relatedTarget`) is outside the root, or unavailable, the draft is committed;
if it's one of Inline Edit's own cancel/confirm buttons, the blur is a no-op and that button's own
`onClick` handles it instead. A `mousedown`-set ref flag on both buttons backs up this check for
browsers that don't reliably move focus to a clicked `<button>` (where `relatedTarget` would
otherwise be unavailable even though the click landed on Inline Edit's own button) - without it,
clicking cancel in such a browser could fire an incorrect auto-confirm from the blur immediately
before cancel's own click handler runs.

Because most values displayed this way are short pieces of text, `children` is expected to be a
single controlled input-like element - `TextField` today, and `Select`/`DatePicker`/`TimePicker`/
`DateTimePicker` once those exist, matching Figma's own five documented slot types. Consumers are
expected to use `appearance="subtle"` on the slotted `TextField` most of the time, since a subtle
field already has no visible border/background at rest, so it reads as plain text until clicked -
the same visual result Figma's blank `state=default` variant implies, achieved by styling the real
input rather than rendering a second, separate read-only display.

---

## Variants

Inline Edit has no size, appearance, or tone variants of its own - Figma's only variant axis
(`state`) maps to internal editing state, not a set of visual variants to pick between.

---

## Content Rules

### Supported Content
A single controlled input-like element appropriate for editing one value - `TextField` today
(typically with `appearance="subtle"`); `Select`, `DatePicker`, `TimePicker`, `DateTimePicker` once
built, matching Figma's own slot. The child must accept `value`, `onChange`, and `readOnly` -
Inline Edit clones it with these props to drive both the read-only and editable states.

### Content Length
Not applicable - Inline Edit has no text content of its own.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| value | string | Yes | - |
| children | `React.ReactElement` | Yes | - |
| onConfirm | `(value: string) => void` | No | undefined |
| onCancel | `() => void` | No | undefined |
| actionButtons | boolean | No | `true` |
| confirmLabel | string | No | `'Confirm'` |
| cancelLabel | string | No | `'Cancel'` |
| className | string | No | undefined |

`confirmLabel`/`cancelLabel` are the accessible names (`aria-label`) for the internal confirm/cancel
`IconButton`s - exposed as props (rather than requiring the consumer to reach into internals) since
Inline Edit, not the consumer, renders those buttons.

---

## Accessibility

### Keyboard Support

- The cloned child stays focusable (via native Tab order) in both states - `readOnly` does not
  remove an element from the tab order, only `disabled` does.
- Focusing the read-only clone (by click or by `Tab`) starts editing.
- `Tab` then reaches the cancel button, then the confirm button, in that order (matching the
  trailing button-group's own internal order confirmed from Figma: close/cancel first, check/confirm
  second).
- `Enter` calls `onConfirm` with the current draft while editing, from anywhere inside the root, then
  blurs the field (deselecting it).
- `Escape` calls `onCancel` and reverts to `value` while editing, from anywhere inside the root, then
  blurs the field (deselecting it).
- `Tab`-ing (or clicking) away from the field to anywhere *outside* Inline Edit while editing also
  calls `onConfirm` with the current draft - the same as clicking confirm. Moving focus to the
  cancel/confirm buttons themselves does not trigger this; their own click handler applies instead.

### ARIA

- No role or accessible name of its own - Inline Edit is a transparent layout wrapper; any labelling
  belongs to the cloned child (e.g. `TextField`'s own `aria-label`).
- The confirm/cancel `IconButton`s each require an accessible name, supplied via `confirmLabel`/
  `cancelLabel` (default English labels `'Confirm'`/`'Cancel'`).

---

## Design Tokens

### Spacing
Gap between the content row and the action row is `--spacing-sm` (8px). Gap between the two action
buttons themselves stays `--spacing-xs` (4px), read directly from Figma's auto-layout `itemSpacing`
on the inner `button-group`.

### Layout
The root diverges from Figma's own single-row layout, per explicit design feedback: `display: flex`,
`flex-direction: column`, `align-items: stretch`, so the field always keeps its full width instead
of sharing a row with (and shrinking to make room for) the action buttons. The content area is
`inline-size: 100%`; the action row sits below it and is `align-self: flex-end`, anchoring the
confirm/cancel pair to the trailing/right edge of the field rather than Figma's literal
same-row-trailing placement. Root is `inline-size: 100%`, matching Figma's `FILL` sizing and
`TextField`'s own convention of filling its container by default.

No color, radius, or typography tokens are owned by Inline Edit itself - all visual styling comes
from the cloned child, and the confirm/cancel `IconButton`s carry their own tokens.

---

## Behaviors

### Read-only (not editing)
Renders the child cloned with `value` and `readOnly`, no action row. Starting to edit happens on
`onFocus` of this clone (click or Tab).

### Editing
Renders the child cloned with the in-progress draft and an `onChange` handler that updates it, plus
a confirm/cancel `IconButton` pair below it (unless `actionButtons={false}`). `Enter`/`Escape` call
`onConfirm`/`onCancel` respectively, in addition to the buttons themselves, then blur the field
(deselecting it, the same as clicking either button already does); losing focus to anything outside
Inline Edit (a click or a Tab) also calls `onConfirm` - clicking/Tab-ing off the field always saves,
never silently discards. Confirming calls `onConfirm(draft)` and returns to read-only; cancelling
discards the draft, calls `onCancel()`, and returns to read-only showing the original `value`.

---

## Dependencies

### Uses
- Icon Button (atom) - the confirm/cancel actions, `size="sm"`, default `shape`/`appearance`
- Text Field (molecule) - the most common cloned control today, typically `appearance="subtle"`

### Used By
- Editable name/title fields
- Inline quantity/value editors
- Any single-value "click to edit" UI

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded colors, spacing, or layout values where a token exists
- No MUI dependency
- No Tailwind dependency
- Do not expose an externally-controlled `isEditing`/`state` prop - editing state is internal, and
  always starts from a read-only display via click/focus (explicit design decision)
- Do not add a `value`/`onChange` pair that commits on every keystroke - only `onConfirm` (on commit)
  and `onCancel` (on revert) cross the component boundary

---

## QA Checklist

### Visual
- [ ] Renders read-only (no action row) before any interaction
- [ ] Focusing/clicking the field starts editing and shows the cancel/confirm icon-button pair below
      the field, anchored to the right edge
- [ ] The field keeps its full width whether or not the action row is showing (never shrinks to make
      room for the buttons)
- [ ] `actionButtons={false}` hides the icon-button pair while still editing
- [ ] Gap between the field and the action row matches `--spacing-sm` (8px); gap between the two
      action buttons themselves matches `--spacing-xs` (4px)
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] `onConfirm` fires with the typed draft when the confirm button is clicked
- [ ] `onCancel` fires when the cancel button is clicked, and the field reverts to `value`
- [ ] `Enter` calls `onConfirm` with the draft while editing, calls `preventDefault`, and blurs the
      field afterward (deselecting it)
- [ ] `Escape` calls `onCancel` while editing, reverting to `value`, and blurs the field afterward
      (deselecting it)
- [ ] `Enter`/`Escape` do nothing before editing has started
- [ ] Clicking/Tab-ing away from the field to anywhere outside Inline Edit while editing calls
      `onConfirm` with the draft (auto-save on blur), and returns to read-only
- [ ] Clicking cancel does not also trigger an auto-confirm from the blur clicking it causes
- [ ] `className` applies to the root
- [ ] Focus is preserved across the read→edit transition (same DOM node, cloned)

### Accessibility
- [ ] Confirm/cancel buttons have accessible names from `confirmLabel`/`cancelLabel`
- [ ] The cloned child stays in the tab order in both states (readOnly, not disabled)
- [ ] Tab order reaches the field, then cancel, then confirm, once editing

---

## Known Limitations
- No `value`/validation handling beyond confirm/cancel - Inline Edit only tracks a transient draft
  while editing; the confirmed value is entirely owned by the parent.
- Only `TextField` exists as a real clonable-control implementation today; `Select`, `DatePicker`,
  `TimePicker`, `DateTimePicker` are documented Figma slot targets but aren't built yet, and would
  need to accept the same `value`/`onChange`/`readOnly` shape Inline Edit clones with.

## Future Enhancements
- Slot support for Select/DatePicker/TimePicker/DateTimePicker once those components exist
