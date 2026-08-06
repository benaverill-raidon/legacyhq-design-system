# Text Field Checklist

## Component Information

### Name
Text Field

### Category
Molecule

### Related Components
- Checkbox
- Radio
- Switch
- Select
- Icon Button (recommended real control for an interactive `iconAfter` clear action)
- Button (for an interactive `iconAfter` action that needs a text label)

---

## Purpose

### What problem does this component solve?
Lets a user type or edit a single line of free text, with consistent sizing, borders, and
interaction states across the product.

### Why does it need to exist?
Every form, search box, and inline-edit surface needs the same text-entry control instead of each
screen styling its own `<input>`.

### What user goal does it support?
- Enter or edit a short text value
- Understand at a glance whether the value is valid, focused, or disabled

---

## Usage

### Where will this component be used?
- Forms
- Search boxes
- Inline-edit fields

### What are the most common use cases?
- Name/email/quantity entry in a form
- A search input
- An inline-editable value

### When should this component NOT be used?
- Multi-line content (no textarea mode)
- Choosing from a fixed set of options (use Select)

---

## Content

### What content can be displayed?
- A single line of typed text, appropriate to the native `type` in use
- An optional leading icon or short text prefix (`iconBefore`) - always decorative
- An optional trailing icon or interactive action (`iconAfter`) - typically an `IconButton`
  (`appearance="subtle"`, `shape="square"`) for a clear action, or a `Button` for a labeled action

### Character Limits
No fixed limit - native `maxLength` applies if the consumer sets it.

---

## Variants

### Size
- sm, md, lg

### Appearance
- default (bordered), subtle (borderless until interacted)

---

## States

Required:
- Default, hover, focus, disabled, invalid

Not Required:
- A separate "typing" or "filled" state - both fall out of native `:placeholder-shown` plus
  whatever value the input actually has, not a prop.

---

## Accessibility

### Does the field need a label?
Yes, always - via a native `<label htmlFor>` pointing at the input's `id`, or `aria-label`/
`aria-labelledby`. Text Field does not manage labelling itself.

### Is aria-invalid needed?
Yes, whenever `invalid` is true.

### Is iconAfter always decorative?
No - unlike `iconBefore` (always `aria-hidden`), `iconAfter` may hold a real interactive control
(e.g. an `IconButton` clear action) and is never forced `aria-hidden`. It must keep its own
accessible name (e.g. `aria-label="Clear"`) and remain reachable by keyboard.

---

## Open Questions
- Should a "Form Field" molecule (label + input + helper/error text) be built once there's a real
  consuming use case?
- Should a textarea variant be added if multi-line entry becomes a real need?

---

## Notes
Figma's `state` variant axis (default/hover/focus/typing/filled) is not a real prop - it resolves
entirely to native `:hover`, `:focus-within`, and `:placeholder-shown`, plus the input's own value.
Figma's `tone` axis is renamed to `appearance` (`standard`→`default`) to match this system's
existing visual-weight vocabulary. `appearance="subtle"` always renders square bottom corners
(top corners only), confirmed from Figma's per-corner radius data. `elemBeforeInput` (icon-or-text,
always decorative) and `elemAfterInput` (icon-or-button, may be interactive) are asymmetric Figma
sub-components, not a symmetric before/after pair. Focus/typing replaces the resting border color
directly (the same pattern `invalid` uses), not an outline ring around it; hover is suppressed while
the field is focused/typing. Neither appearance changes real `border-width` on focus/invalid -
`appearance="default"` and `appearance="subtle"` both rest at 1px at every state (rest, hover,
focus, invalid), painting the "thicker" look via `box-shadow` only, so the input text and typing
caret never shift position. Hovering an invalid `appearance="subtle"` field keeps the error border
color instead of resetting it. See `text-field-spec.md` for the full reasoning.
