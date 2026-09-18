# Date Picker

## Purpose

Date Picker is an organism: a date field that opens the Date Picker Calendar in a popup. The
read-only field shows the selected date and a calendar icon; the calendar does the picking.

## When to use

Use it wherever someone enters a single date in a form or filter and benefits from a calendar to pick
it.

## When not to use

Do not use it for an inline, always-visible calendar (use Date Picker Calendar directly). Do not use
it for time (use Time Picker; Date/Time Picker combines both). For a small set of preset dates, a
Select may be simpler.

## Design intent

The trigger is a Text Field showing the formatted date plus a trailing calendar icon. `context` maps
to the Text Field appearance: `default` is a bordered field; `inline` is borderless (subtle). Three
sizes (`sm`/`md`/`lg`) match the field sizes. The open state is drawn by pinning the field's focus
treatment - a `border/focus` box for `default`, a `border/focus` underline for `inline` - matching the
Figma `open` variant. `disabled` and `invalid` map to the Text Field's own states.

Opening anchors a Popup to the field frame (bottom-left by default) and renders the Date Picker
Calendar inside it; the popup provides the surface and the calendar fills it. Selecting a day fills the
field, closes the popup, and returns focus to the field.

The field is read-only in this version (pick via the calendar); typing a date directly is a future
addition. `min`, `max`, `isDateDisabled`, `weekStartsOn`, `today`, and `locale` pass through to the
calendar.

## Accessibility expectations

The field is the disclosure control: it carries `aria-haspopup="dialog"` and, while open,
`aria-expanded` + `aria-controls` (managed by Popup) pointing at the `role="dialog"` panel. Opening
moves focus into the calendar grid; Escape or selecting a day closes the popup and returns focus to
the field. Outside clicks dismiss without stealing focus. The calendar carries its own grid semantics
and keyboard model.

## Related components

- Date Picker Calendar
- Date/Time Picker
- Time Picker
- Text Field
- Popup
