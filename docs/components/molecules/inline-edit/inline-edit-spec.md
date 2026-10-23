# Inline Edit

## Overview

### Purpose
Inline Edit lets a value switch between a read display and an editable control in place, with an
explicit confirm/cancel step.

### Description
Use Inline Edit to make a single displayed value directly editable on the same spot on the page,
rather than always showing an open input or requiring a separate form/dialog.

### Tier
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
   └─ ButtonGroup.actions (optional, only once editing has started && actionButtons; absolutely
      positioned below the field at its trailing edge, or past that edge with actionPlacement="end")
      ├─ IconButton (cancel/close), size xs
      └─ IconButton (confirm/check), size xs
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
feedback, this implementation instead floats the action row: it's absolutely positioned 8px
(`--spacing-sm`) below the field at its trailing edge, or with `actionPlacement="end"` 8px past the
field's trailing edge (centered on it, or with `actionAlignment="start"` held at the first line's
control height so it stays put as a multi-line field grows). The field keeps its full width whether
or not it's being edited, the layout never shifts, and the buttons float over whatever sits below or
beside the field, so the container has to leave room for them.

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
accidental form submission. Both keys leave focus on the field, which turns read-only, so a
keyboard user stays where they were (until 2026-10-17 both blurred the field, dropping focus to the
page). Escape pressed on a cancel/confirm button first moves focus to the field, since the buttons
unmount; clicking either button does the same. Because the field may then already have focus, a
click or `Enter` on the read-only field starts editing again (focus alone can't, as no focus event
fires); the child's own `onClick`/`onKeyDown` still run first, and `Enter` calls `preventDefault`
there too, so a read-only field in a `<form>` doesn't submit it.

Clicking (or Tab-ing) away from the field while editing - anywhere other than the cancel/confirm
buttons themselves - commits the draft, the same as clicking confirm, per explicit design feedback:
"if I activate the text-field, then click off (not on cancel/confirm) it should work just like
clicking confirm." This is implemented as an `onBlur` handler on the root: if the element about to
receive focus (`event.relatedTarget`) is outside the root, or unavailable, the draft is committed;
if it's one of Inline Edit's own cancel/confirm buttons, the blur is a no-op and that button's own
`onClick` handles it instead. A draft equal to `value` isn't committed on blur: editing just ends,
without `onConfirm`, so tabbing through the field and both buttons without typing doesn't report an
edit that didn't happen (Enter and the confirm button still call `onConfirm`, as explicit choices). A `mousedown`-set ref flag on both buttons backs up this check for
browsers that don't reliably move focus to a clicked `<button>` (where `relatedTarget` would
otherwise be unavailable even though the click landed on Inline Edit's own button) - without it,
clicking cancel in such a browser could fire an incorrect auto-confirm from the blur immediately
before cancel's own click handler runs.

Because most values displayed this way are short pieces of text, `children` is expected to be a
single controlled input-like element - `TextField` today, and `Select`/`DatePicker`/`TimePicker`/
`DateTimePicker` once those exist, matching Figma's own five documented slot types. Consumers are
expected to use `context="inline"` on the slotted `TextField` most of the time, since an inline
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
(typically with `context="inline"`); `Select`, `DatePicker`, `TimePicker`, `DateTimePicker` once
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
| validate | `(value: string) => string \| undefined` | No | undefined |
| actionButtons | boolean | No | `true` |
| actionPlacement | `'below' \| 'end'` | No | `'below'` |
| actionAlignment | `'center' \| 'start'` | No | `'center'` |
| confirmLabel | string | No | `'Confirm'` |
| cancelLabel | string | No | `'Cancel'` |
| className | string | No | undefined |
| id | string | No | undefined |
| aria-labelledby | string | No | undefined |
| aria-describedby | string | No | undefined |
| aria-invalid | `boolean \| 'true' \| 'false'` | No | undefined |
| required | boolean | No | undefined |
| context | `'default' \| 'inline'` | No | undefined |

`id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`, and `context` are the
wiring a Field around Inline Edit sets on it (it also passes `data-force-state` for Storybook's
state previews). Inline Edit passes them on to the child in both modes, filling in only what the
child leaves unset, as Field does: the child's own values win, a child with its own `aria-label`
keeps Field's `aria-labelledby` off, and descriptions add up - the child's own, then Field's
message, then `validate`'s message while it shows. `context` is passed only when it's `inline` and
the child sets no `context` (or deprecated `appearance` / `tone`).

`validate`'s message and Field's message both show: `validate`'s under the field, inside Inline
Edit, while it rejects the draft; Field's below Inline Edit as always. One is about the draft, the
other is help or an error about the saved value, so neither replaces the other. The child stays
`aria-invalid` while either says so.

`confirmLabel`/`cancelLabel` are the accessible names (`aria-label`) for the internal confirm/cancel
`IconButton`s - exposed as props (rather than requiring the consumer to reach into internals) since
Inline Edit, not the consumer, renders those buttons.

---

## Accessibility

### Keyboard Support

- The cloned child stays focusable (via native Tab order) in both states - `readOnly` does not
  remove an element from the tab order, only `disabled` does.
- Focusing the read-only clone (by click or by `Tab`) starts editing. When it already has focus
  (after an edit ends), a click or `Enter` starts editing.
- `Tab` then reaches the cancel button, then the confirm button, in that order (matching the
  trailing button-group's own internal order confirmed from Figma: close/cancel first, check/confirm
  second).
- `Enter` calls `onConfirm` with the current draft while editing a single-line field; focus stays on
  the field, now read-only. In a textarea, `Enter` adds a line and `Ctrl`/`Cmd`+`Enter` confirms. On
  a focused cancel/confirm button, `Enter` activates that button instead, and focus moves to the
  field.
- Tabbing through the field and both buttons without typing doesn't call `onConfirm`: with the draft
  unchanged, focus leaving the root just ends editing.
- `Escape` calls `onCancel` and reverts to `value` while editing, from anywhere inside the root; focus
  ends on the read-only field. It also clears `validate`'s error.
- With `validate`, a rejected `Enter` or confirm-button press keeps editing and leaves focus in the
  field; a rejected blur keeps editing without moving focus back.
- `Tab`-ing (or clicking) away from the field to anywhere *outside* Inline Edit while editing also
  calls `onConfirm` with the current draft - the same as clicking confirm. Moving focus to the
  cancel/confirm buttons themselves does not trigger this; their own click handler applies instead.

### ARIA

- No role or accessible name of its own - Inline Edit is a transparent layout wrapper; any labelling
  belongs to the cloned child (e.g. `TextField`'s own `aria-label`).
- The confirm/cancel `IconButton`s each require an accessible name, supplied via `confirmLabel`/
  `cancelLabel` (default English labels `'Confirm'`/`'Cancel'`).
- While `validate` rejects the draft, the child gets `invalid`, `aria-invalid`, and the message's id
  added after its own `aria-describedby`. The message sits in a polite live region rendered from the
  start of editing (when `validate` is set), so it's announced after `Enter`, when focus doesn't
  move. Its status icon is `aria-hidden`.

---

## Design Tokens

### Spacing
The action row floats `--spacing-sm` (8px) from the field: below it, or past its trailing edge with
`actionPlacement="end"`. The gap between the two action buttons is `--spacing-xs` (4px), matching
Figma's `itemSpacing: 4`; `.root .actions` overrides Button Group's default 8px.

### Layout
The root diverges from Figma's own single-row layout, per explicit design feedback: a one-column
grid (`grid-template-columns: minmax(0, 1fr)`, rows for the field and `validate`'s message), so the
field always keeps its full width instead of sharing a row with (and shrinking to make room for)
the action buttons. With `actionPlacement="end"` and in a Table cell, the action row is placed in
the first grid row, so that row is its containing block and a message below doesn't move it. The content area is
`inline-size: 100%`; the action row is absolutely positioned (`z-index: 1`) below the field at its
trailing edge, or past that edge with `actionPlacement="end"`, rather than Figma's literal
same-row-trailing placement. Inside a Table's editable cell (`data-editable-cell`), the read-only
child gets an edit icon in `iconAfter` and starts editing on click too; while editing, the actions
sit inside the cell at its trailing edge, vertically centered, the child reserves padding for them,
and it shows a focus-colored bottom line. Root is `inline-size: 100%`, matching Figma's `FILL` sizing and
`TextField`'s own convention of filling its container by default.

### Error message
`validate`'s message copies Field's error look: the small error status icon (`sm`, no spacing,
`color="error"`), `--spacing-075` before the text, `body-sm` in `--color-content-error`, and
`--spacing-xs` above it. It's indented like Field's inline context, by the inline control's text
inset: `--spacing-sm` for `sm`/`md`, `--spacing-md` for `lg`.

Apart from that message, no color, radius, or typography tokens are owned by Inline Edit itself -
all visual styling comes from the cloned child, and the confirm/cancel `IconButton`s carry their own
tokens.

---

## Behaviors

### Read-only (not editing)
Renders the child cloned with `value` and `readOnly`, no action row. Starting to edit happens on
`onFocus` of this clone (click or Tab), or on a click or `Enter` when it already has focus.

### Editing
Renders the child cloned with the in-progress draft and an `onChange` handler that updates it, plus
a confirm/cancel `IconButton` pair below it (unless `actionButtons={false}`). `Enter`/`Escape` call
`onConfirm`/`onCancel` respectively, in addition to the buttons themselves; after any of the four,
focus is on the read-only field. Losing focus to anything outside Inline Edit (a click or a Tab) also
calls `onConfirm` when the draft changed - clicking/Tab-ing off the field always saves, never
silently discards - and just ends editing when it didn't. Confirming calls `onConfirm(draft)` and returns to read-only; cancelling
discards the draft, calls `onCancel()`, and returns to read-only showing the original `value`.

### Validating
With `validate`, every confirm (Enter, the confirm button, a blur with a changed draft) first calls
`validate(draft)`. A returned message rejects the draft: `onConfirm` isn't called, editing goes on
with the draft, the message shows under the field, and the child is marked invalid. After a
rejection the message is recomputed as the draft changes, so it clears once the draft is fixed.
Cancel, Escape, a new edit, a successful confirm, and a blur with an unchanged draft clear it.

---

## Dependencies

### Uses
- Icon Button (atom) - the confirm/cancel actions, `size="xs"`, `appearance="default"`, repainted
  with the neutral-subtle fill
- Button Group (molecule) - holds the action pair (a documented tier exception)
- Text Field (molecule) - the most common cloned control today, typically `context="inline"`

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
- [ ] The action row floats `--spacing-sm` (8px) from the field; the gap between the two action
      buttons is `--spacing-xs` (4px)
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] `onConfirm` fires with the typed draft when the confirm button is clicked
- [ ] `onCancel` fires when the cancel button is clicked, and the field reverts to `value`
- [ ] `Enter` calls `onConfirm` with the draft while editing, calls `preventDefault`, and leaves
      focus on the field, now read-only
- [ ] `Escape` calls `onCancel` while editing, reverting to `value`, with focus on the read-only
      field (moved there from a cancel/confirm button)
- [ ] Clicking cancel or confirm returns focus to the read-only field
- [ ] `Enter`/`Escape` never confirm or cancel before editing has started; `Enter` or a click on the
      focused read-only field starts editing
- [ ] Clicking/Tab-ing away from the field to anywhere outside Inline Edit while editing calls
      `onConfirm` with a changed draft (auto-save on blur), and returns to read-only
- [ ] Tabbing through without changing the draft ends editing without calling `onConfirm`
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
