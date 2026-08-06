# Inline Edit

Inline Edit is a molecule that lets a single displayed value switch between a read-only display and
an editable control in place, on the same spot on the page, without navigating to a separate form.
Editing always starts on click (or Tab-in) - there is no state where the confirm/cancel buttons show
before the field has been interacted with; every real use case starts read-only.

Use Inline Edit whenever a single value - a name, a title, a quantity - should be editable directly
where it's displayed, with an explicit confirm/cancel step, rather than always showing an open input
or requiring a separate edit screen/dialog.

Inline Edit takes a single child - most commonly a `TextField` with `appearance="subtle"`, since a
subtle field already reads as plain text at rest - and clones it for both states: read-only (not
editable, but still focusable, showing the last confirmed `value`) and editable (showing the
in-progress draft while the user types). A trailing confirm (check) / cancel (X) icon-button pair
appears only once editing has started - controllable via `actionButtons` - and `Enter`/`Escape` work
as shortcuts for confirm/cancel from anywhere inside it, in addition to the visible buttons.

`value` is controlled the same way `TextField`'s own `value` is: the parent supplies the last
confirmed value and gets it back via `onConfirm` only when the user commits an edit, not on every
keystroke. Cancelling discards whatever was typed and reverts the field to `value` - Inline Edit
owns the in-progress draft, not the confirmed value.

Do not use Inline Edit for multi-field forms - it wraps exactly one value/control at a time. Do not
use it when the edit needs its own dedicated screen or dialog (a lot of fields, a multi-step flow,
or anything that benefits from more space) - use a real form instead.

Related components and patterns include Text Field (the control Inline Edit clones, typically with
`appearance="subtle"`), Icon Button (the confirm/cancel actions), and Button Group (a similar
"compose atoms into a named layout" molecule, though Button Group has no state of its own while
Inline Edit does).
