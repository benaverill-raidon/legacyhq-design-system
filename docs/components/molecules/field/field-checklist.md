# Field Checklist

## Component Information

### Name
Field

### Category
Molecule

### Related Components
- Text Field, Text Area, Select (the controls Field wraps)
- Label (the standalone pill/overline label atom - distinct from Field's built-in form label)
- Inline Message, Section Message (standalone messages - distinct from Field's per-control message)

---

## Purpose

### What problem does this component solve?
Gives a single form control a label above it and optional helper/error text below it, and does the
`htmlFor` / `aria-describedby` / `aria-invalid` / `required` wiring once instead of at every call
site.

### Why does it need to exist?
Text Field, Text Area, and Select render only their control frame with no label of their own. Every
form needs the same label + message + validation scaffold around them; Field is that shared,
accessible scaffold.

### What user goal does it support?
- Understand what a control is for (its label) and how to fill it in (its helper text)
- See at a glance whether the value is valid or in error, with a matching icon and colour

---

## Usage

### Where will this component be used?
- Forms of every kind - the default wrapper for a labelled control

### What are the most common use cases?
- A labelled Text Field with helper text
- A field showing an inline validation error or success message
- A required field

### When should this component NOT be used?
- A bare control with no label/helper/error (use the control with an `aria-label`)
- One label for a *group* of controls (use `<fieldset>`/`<legend>`)
- A page/section-level message (use Inline Message / Section Message)

---

## Content

### What content can be displayed?
- A label (with an optional required `*`)
- A single wrapped control (the slot)
- A helper/error/success message, with a status icon on error/valid

### Character Limits
None - the label and message wrap.

---

## Variants

### State
- default, error, valid

### Context
- default (flush with the control edge; size-independent; control keeps its appearance), inline
  (label/message indented to the control's inner text AND the control rendered inline/borderless via
  appearance="subtle" - for text-bearing controls: Text Field, Select, Text Area, pickers)

### Size
- sm, md, lg (matches the wrapped control). Consumed only in the inline context, to align the
  label/message with the control's inner text (lg indents more; sm and md share one). No effect in
  the default context; never resizes the control.

---

## States

Required:
- default, error, valid

Not Required:
- hover/focus/disabled are the *control's* states, not Field's - Field forwards `data-force-state`
  to the control for documentation but has no interactive state of its own.

---

## Accessibility

### Does the control need a separate label?
No - Field's `label` is a real `<label htmlFor>` and becomes the control's accessible name. Don't
also pass an `aria-label` to the control.

### How is the message announced?
Via `aria-describedby` on the control, merged with any `aria-describedby` the control already has.

### Is aria-invalid handled?
Yes - `state="error"` sets `aria-invalid` on the control (unless the control sets its own).

### Is the required `*` read out?
No - it's `aria-hidden`. The forwarded native `required` is what conveys the requirement.

### What must the consumer still do?
Set the control's own visual error prop (e.g. `<TextField invalid />`) alongside `state="error"` -
Field sets `aria-invalid` but not the control's border. Match `size` on Field and the control.

---

## Open Questions
- Should Field grow an optional slot for a trailing label action (e.g. an "Optional" tag or a
  character counter) if a real use case appears?
- Should a `disabled` convenience prop fan out to both the label styling and the control, or stay
  the control's responsibility?

---

## Notes
Field renders its own label and message rather than reusing the Label atom or Inline Message - the
Figma `<label>`/`<message>` code-parts use different typography and a smaller state set than those
components. `state` drives the label/message layer and `aria-invalid` only, never the control's own
border. `context` is a single shared axis in Figma (it sits on the field AND the control), so
`context="inline"` both indents the label/message to the control's inner text and renders the control
inline by injecting `appearance="subtle"` (Text Field/Text Area take `appearance`; Select gained an
additive `appearance` alias for its `tone`). `context`/`size` are coupled - the indent is 0 in
default (size-independent) and the control's inner padding in inline, where `lg` indents more than
the shared `sm`/`md`, per Figma's `size=all | lg | sm/md` model; inline is for text-bearing controls
(Text Field, Select, Text Area, pickers), not Checkbox/Switch/Radio. Auto-wiring is done by cloning
the single child control and only filling in props the control left unset. See `field-spec.md` for
the full reasoning.
