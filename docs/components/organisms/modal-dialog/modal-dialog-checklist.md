# Modal Dialog Checklist

## Component Information

### Name
Modal Dialog

### Category
Organism

### Related Components
- Button (footer actions), Icon Button (the close button)
- Toast (non-blocking transient feedback - the alternative when a modal is too heavy)
- Dropdown Menu / Menu (contextual overflow anchored to a control)

---

## Purpose

### What problem does this component solve?
Interrupts the flow to focus the user on one task or decision, over a backdrop, with the modal
behaviour (portal, focus trap, dismissal, scroll lock, accessible semantics) handled correctly in one
place.

### Why does it need to exist?
Every product needs confirmations and focused tasks that block the page. Getting focus trapping,
scroll lock, Escape/backdrop dismissal, portaling, and `aria-modal` right is subtle - Modal Dialog
does it once.

### What user goal does it support?
- Make a decision (confirm/cancel), especially a destructive one, without losing context
- Complete a short focused task or acknowledge important content

---

## Usage

### Where will this component be used?
- Confirmations (delete, discard, publish), short focused forms, content acknowledgements

### What are the most common use cases?
- A destructive confirmation (error appearance + a red Confirm)
- A "save changes?" prompt
- A short form or informational dialog

### When should this component NOT be used?
- Non-blocking transient feedback (use Toast)
- Contextual overflow anchored to a control (use Dropdown Menu / Menu)
- A large or multi-step flow (prefer a full page)

---

## Content

### What content can be displayed?
- Header: a title (+ optional status icon for warning/error), an optional description line, and a
  close button
- Body: arbitrary content, scrollable when tall
- Footer: right-aligned actions (typically Cancel + Confirm). Built to hold action controls - Figma's
  footer preferred-slot list is Button, Icon Button, Link, Link Button, Split Button, Toggle Button,
  Toggle Icon Button

### Character Limits
None - the title wraps; the body scrolls.

---

## Variants

### Appearance
- default, warning (status icon), error (status icon)

### Width
- small (400px), medium (600px), large (752px), extraLarge (968px)

---

## States

Required:
- open / closed (controlled via `open`)

Not Required:
- Modal Dialog manages no internal open state - it is a pure function of `open`, closing only by
  calling `onClose`.

---

## Accessibility

### Does it have the right dialog semantics?
Yes - `role="dialog"` + `aria-modal="true"`, named by `title` (`aria-labelledby`) or `aria-label`.

### Is focus handled?
Yes - focus moves into the panel on open, is trapped on Tab within it, and returns to the trigger on
close. `initialFocusRef` overrides the initial target.

### How is it dismissed?
The close button, Escape (`closeOnEscape`), and a backdrop click (`closeOnBackdropClick`) - all call
`onClose`. The close button is labelled "Close" (`closeLabel`).

### Is the status icon meaningful?
No - it's decorative; the appearance's meaning is carried by the title and actions.

### What must the consumer still do?
Give the dialog an accessible name; pair `appearance="error"`/`"warning"` with a matching Confirm
button tone (Modal Dialog does not tone footer buttons).

---

## Open Questions
- Should Modal Dialog offer enter/exit transitions beyond the light fade-in it ships with?
- Should it grow a scroll-into-view or "sticky header shadow" affordance for very long bodies?

---

## Notes
Built standalone (not on the Popup primitive, which is a positioned popover with no focus trap /
backdrop / scroll lock). Controlled and `onClose`-only. `appearance` adds a header status icon but
does not tone the footer buttons (the consumer pairs the Confirm button tone). The panel surface uses
the shared floating-surface token `--color-elevation-surface-raised-default` (Figma names it
`overlay/default`), and the backdrop fills the viewport, insetting the panel with `--spacing-4xl`
(Figma's 64px around the panel was artboard framing, not a design value). See `modal-dialog-spec.md`
for the full reasoning.
