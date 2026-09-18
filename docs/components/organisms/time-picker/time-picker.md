# Time Picker

## Purpose

Time Picker is an organism: a time field that opens a three-column time selector (hours, minutes,
AM/PM) in a popup. The read-only field shows the selected time and a clock icon; the columns do the
picking, and a Confirm commits the choice.

## When to use

Use it wherever someone enters a time of day in a form or filter.

## When not to use

Do not use it to pick a date (use Date Picker; Date/Time Picker combines both) or to enter a duration.

## Design intent

The trigger is a Text Field showing the formatted time plus a trailing clock icon - the same field
pattern as Date Picker. `context` maps to the Text Field appearance (`default` bordered, `inline`
borderless), three sizes (`sm`/`md`/`lg`), and the open state pins the field's focus treatment. The
popup holds three scrollable listboxes - hours (12-hour), minutes (in `minuteStep` increments), and
AM/PM - each highlighting its selected option with the selected surface + selected content tokens
(the Figma menu-item states). A footer holds Cancel and Confirm. Column changes are **staged** and
previewed live in the field: **Confirm or an outside click** commits them, while **Cancel or Escape**
discards them.

The value is carried on a `Date` (only hours and minutes are used) so it composes cleanly with the
Date Picker in a Date/Time Picker.

## Accessibility expectations

The field carries `aria-haspopup="dialog"` and, while open, `aria-expanded` + `aria-controls`
(managed by Popup) pointing at the `role="dialog"` panel. Each column is a `role="listbox"` of
`role="option"` buttons with a roving tabindex; Arrow Up/Down and Home/End move within a column, Tab
moves between columns. While open, the field previews the staged selection live; Confirm or an outside
click commits it, and Cancel or Escape discards it (returning focus to the field). Focus uses the
shared Focus Ring.

## Related components

- Date Picker
- Date/Time Picker
- Text Field
- Popup
- Button
