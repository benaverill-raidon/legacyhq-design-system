# Inline Edit Checklist

## Component Information

### Name
Inline Edit

### Category
Molecule

### Related Components
- Text Field
- Icon Button
- Button Group

---

## Purpose

### What problem does this component solve?
Lets a single displayed value become editable in place, starting on click, with a consistent
confirm/cancel step - instead of always showing an open input or requiring a separate form.

### Why does it need to exist?
"Click a value to edit it, then confirm or cancel" is a recurring pattern that needs the same
click-to-edit trigger, trailing action-button chrome, and keyboard shortcuts everywhere it appears,
instead of every call site rebuilding draft/value tracking from scratch.

### What user goal does it support?
- Edit a single value quickly, without leaving the page
- Clearly confirm or discard the edit before it takes effect

---

## Usage

### Where will this component be used?
- Editable name/title fields
- Inline quantity/value editors
- Any single-value "click to edit" UI

### What are the most common use cases?
- Renaming an item in place
- Adjusting a single numeric/text value without opening a dialog

### When should this component NOT be used?
- Editing multiple related fields together (use a real form)
- An edit that needs its own dedicated space (a dialog or separate screen)

---

## Content

### What content can be displayed?
- A single controlled input-like element as `children` - typically a `TextField` with
  `appearance="subtle"`, cloned by Inline Edit for both the read-only and editable states

### Character Limits
Not applicable - Inline Edit has no text content of its own.

---

## Variants

Inline Edit has no size/appearance/tone variants. Figma's only variant axis (`state`: default/edit)
maps to internal editing state, not a set of visual choices.

---

## States

Required:
- Read-only (not editing) - renders the cloned child with `value`, no action row
- Editing (started by click/focus) - renders the cloned child with the in-progress draft, plus the
  confirm/cancel action pair

Not Required:
- A prop-driven "start already editing" state - there is no example where confirm/cancel should
  show before the field has been interacted with (explicit design decision)

---

## Accessibility

### Does it need a label?
No label of its own - Inline Edit is a transparent wrapper. Any labelling belongs to the cloned
child (e.g. `TextField`'s own `aria-label`).

### Are the action buttons labelled?
Yes, always - via `confirmLabel`/`cancelLabel` props (default `'Confirm'`/`'Cancel'`), passed as
`aria-label` to the internal `IconButton`s.

### What happens if the user clicks/tabs away without pressing confirm or cancel?
The draft is committed - the same as clicking confirm. Clicking/Tab-ing off the field always saves;
it never silently discards. Only clicking cancel (or pressing Escape) discards the draft.

---

## Open Questions
- Should `Select`/`DatePicker`/`TimePicker`/`DateTimePicker` support be validated once those
  components exist, given they'll need to accept the same `value`/`onChange`/`readOnly` shape Inline
  Edit clones with?
- Should Inline Edit ever support a non-text draft type (e.g. a `Date` for a future `DatePicker`),
  or does `value: string` cover every real use case?

---

## Notes
Figma's `state` variant axis (`default`/`edit`) is not a prop at all - editing state is owned
internally and always starts from a read-only display via click/focus. Two earlier passes exposed
`isEditing` as an external prop (first fully controlled, later still controlled but reachable via a
manual toggle); both were reverted after explicit design feedback that no real use case wants
confirm/cancel visible before the field is interacted with. `value`/`onConfirm` now mirror
`TextField`'s own controlled `value` pattern - confirm commits the draft typed during the edit
session, cancel reverts to the last confirmed value. See `inline-edit-spec.md` for the full
reasoning.
